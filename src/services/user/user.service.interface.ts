import { AccountDto, DecodeCredentialDto } from "../../dto";
import { CredentialDto } from "../../dto";
import { Account } from "../../entities/Account";
import { User } from "../../entities/UserEntity";
import { UserParent } from "../../entities/UserParent";
import { UserStudent } from "../../entities/UserStudent";

export default interface UserService {
    signin: (dto: AccountDto) => Promise<CredentialDto>;

    decode: (dto: CredentialDto) => Promise<DecodeCredentialDto>;

    signup: (user: User, account: Account, userType: UserStudent | UserParent) => any;

    checkOldEmail: (email: string) => Promise<Boolean>;

    modifyAccount: (oldAccount: AccountDto, newAccount: AccountDto) => Promise<boolean>;
}