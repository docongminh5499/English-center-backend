import { User } from "./UserEntity";
import { UserStudent } from "./UserStudent";
import { UserRole } from "../utils/constants/role.constant";
export declare class UserParent extends User {
    id: number;
    roles: UserRole.PARENT;
    userStudent: UserStudent[];
}
