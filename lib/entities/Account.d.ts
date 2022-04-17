import { AccountRole } from "../utils/constants/role.constant";
import { MyBaseEntity } from "./MyBaseEntity";
export declare class Account extends MyBaseEntity {
    id: number;
    username: string;
    password: string;
    role: AccountRole;
}
