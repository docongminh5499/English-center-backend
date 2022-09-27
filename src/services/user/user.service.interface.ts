import { AccountDto, DecodeCredentialDto } from "../../dto";
import { CredentialDto } from "../../dto";
import { Account } from "../../entities/Account";
import { User } from "../../entities/UserEntity";

export default interface UserService {
    signin: (dto: AccountDto) => Promise<CredentialDto>;

    decode: (dto: CredentialDto) => Promise<DecodeCredentialDto>;

    signup: (user: User, account: Account) => any;

    checkOldEmail: (email: string) => Promise<Boolean>;
}