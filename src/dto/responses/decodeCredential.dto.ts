import { AccountRole } from "../../utils/constants/role.constant";

export default class DecodeCredentialDto {
    fullName: string;
    userId: string;
    userName: string;
    role: AccountRole;
    exp: number;
    avatar: string;
    isManager: boolean;
    version: number;
}
