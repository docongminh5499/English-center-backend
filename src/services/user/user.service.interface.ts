import { AccountDto, DecodeCredentialDto } from "../../dto";
import { CredentialDto } from "../../dto";

export default interface UserService {
    signin: (dto: AccountDto) => Promise<CredentialDto>;

    decode: (dto: CredentialDto) => Promise<DecodeCredentialDto>;
}