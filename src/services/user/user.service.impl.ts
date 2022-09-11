import * as bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";
import { AccountDto } from "../../dto";
import { CredentialDto } from "../../dto";
import { AccountRepository } from "../../repositories";
import { ValidationError } from "../../utils/errors/validation.error";
import { NotFoundError } from "../../utils/errors/notFound.error";
import UserServiceInterface from "./user.service.interface";


class UserServiceImpl implements UserServiceInterface {
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
				role: account.role
			}, process.env.TOKEN_KEY || "", { expiresIn: "1d" });
			return credentialDto;
		}
		throw new NotFoundError();
	}
}

const UserService = new UserServiceImpl();
export default UserService;