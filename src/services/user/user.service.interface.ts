import { AccountDto } from "../../dto";
import { CredentialDto } from "../../dto";

export default interface UserService {
    signin: (dto: AccountDto) => Promise<CredentialDto>;
}