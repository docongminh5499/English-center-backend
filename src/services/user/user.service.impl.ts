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


class UserServiceImpl implements UserServiceInterface {
	async decode(dto: CredentialDto): Promise<DecodeCredentialDto> {
		if (dto.token === undefined)
			throw new InvalidTokenError();
		try {
			const decoded = jwt.verify(dto.token, process.env.TOKEN_KEY || "") as DecodeCredentialDto;
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
			const credentialDto = new CredentialDto();
			credentialDto.token = jwt.sign({
				fullName: account.user.fullName,
				userId: account.user.id,
				userName: account.username,
				role: account.role,
				avatar: account.user.avatar,
			}, process.env.TOKEN_KEY || "", { expiresIn: "1d" });
			return credentialDto;
		}
		throw new NotFoundError();
	}

	async signup(user: User, account: Account){
		const isOld = await AccountRepository.findByUserName(account.username);
		if(isOld){
			throw new DuplicateError();
		}
		try{
			await User.save(user);
			await Account.save(account);
		}catch(err){
			
		}
	}

	async checkOldEmail(email: string): Promise<Boolean>{
		const user = await AccountRepository.findUserByEmail(email);
		if(user == null)
			return false;
		return true;
	}
}

const UserService = new UserServiceImpl();
export default UserService;