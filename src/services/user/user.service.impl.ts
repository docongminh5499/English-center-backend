import * as bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";
import { AccountDto, DecodeCredentialDto } from "../../dto";
import { CredentialDto } from "../../dto";
import { AccountRepository } from "../../repositories";
import { ValidationError } from "../../utils/errors/validation.error";
import { NotFoundError } from "../../utils/errors/notFound.error";
import UserServiceInterface from "./user.service.interface";
import { InvalidTokenError } from "../../utils/errors/invalidToken.error";
import { User } from "../../entities/UserEntity";
import { Account } from "../../entities/Account";
import { DuplicateError } from "../../utils/errors/duplicate.error";
import BranchRepository from "../../repositories/branch/branch.repository.impl";
import { AppDataSource } from "../../utils/functions/dataSource";
import { io } from "../../socket";


class UserServiceImpl implements UserServiceInterface {
	async decode(dto: CredentialDto): Promise<DecodeCredentialDto> {
		if (dto.token === undefined)
			throw new InvalidTokenError();
		try {
			const decoded = jwt.verify(dto.token, process.env.TOKEN_KEY || "") as DecodeCredentialDto;
			const account = await AccountRepository.findByUserName(decoded.userName);
			if (account === null) throw new InvalidTokenError();
			if (account.version !== decoded.version) throw new InvalidTokenError();
			return decoded;
		} catch (err) {
			console.log(err);
			throw new InvalidTokenError();
		}
	}


	async signin(dto: AccountDto): Promise<CredentialDto> {
		if (!(dto.username && dto.password))
			throw new ValidationError([]);

		const account = await AccountRepository.findByUserName(dto.username);
		if (account && (await bcrypt.compare(dto.password as string, account.password))) {
			const isManager = await BranchRepository.checkIsManager(account.user.id);
			const credentialDto = new CredentialDto();
			credentialDto.token = jwt.sign({
				fullName: account.user.fullName,
				userId: account.user.id,
				userName: account.username,
				role: account.role,
				avatar: account.user.avatar,
				isManager: isManager,
				version: account?.version,
			}, process.env.TOKEN_KEY || "", { expiresIn: "1d" });
			return credentialDto;
		}
		throw new NotFoundError();
	}

	async signup(user: User, account: Account) {
		const isOld = await AccountRepository.findByUserName(account.username);
		if (isOld) {
			throw new DuplicateError();
		}
		try {
			await User.save(user);
			await Account.save(account);
		} catch (err) {

		}
	}

	async checkOldEmail(email: string): Promise<Boolean> {
		const user = await AccountRepository.findUserByEmail(email);
		if (user == null)
			return false;
		return true;
	}


	async modifyAccount(oldAccount: AccountDto, newAccount: AccountDto): Promise<boolean> {
		if (oldAccount.username === undefined || oldAccount.password === undefined || newAccount.username === undefined)
			return false;

		const queryRunner = AppDataSource.createQueryRunner();
		await queryRunner.connect()
		await queryRunner.startTransaction()
		try {
			const account = await queryRunner.manager.findOne(Account, {
				where: { username: oldAccount.username },
				relations: ['user', 'user.socketStatuses'],
				lock: { mode: "pessimistic_write" },
				transaction: true,
			});
			if (account === null || (await bcrypt.compare(oldAccount.password, account.password)) == false)
				throw new NotFoundError();
			// Update data
			account.username = newAccount.username;
			if (newAccount.password)
				account.password = await bcrypt.hash(newAccount.password, 10);
			// Execute sql statement
			await queryRunner.manager.update(Account, oldAccount.username, {
				username: account.username,
				password: account.password,
			});
			await queryRunner.commitTransaction();
			await queryRunner.release();
			// Send event to logout
			account.user.socketStatuses.forEach(socket => {
				io.to(socket.socketId).emit("modifyAccount");
			});
			return true;
		} catch (error) {
			console.log(error);
			await queryRunner.rollbackTransaction();
			await queryRunner.release();
			return false;
		}
	}
}

const UserService = new UserServiceImpl();
export default UserService;