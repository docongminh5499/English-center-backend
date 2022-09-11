import { AccountRole } from "../../utils/constants/role.constant";

export default class AccountDto {
    username?: string;
    password?: string;
    role?: AccountRole;
}