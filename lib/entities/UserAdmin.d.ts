import { User } from "./UserEntity";
import { UserRole } from "../utils/constants/role.constant";
export declare class UserAdmin extends User {
    id: number;
    roles: UserRole.ADMIN;
    user: User[];
}
