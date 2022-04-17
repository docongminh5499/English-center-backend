import { UserRole } from "../utils/constants/role.constant";
export declare class User {
    id: number;
    email: string;
    fullName: string;
    phone: number;
    age: number;
    sex: number;
    address: string;
    createdU: Date;
    updatedU: Date;
    roles: UserRole;
}
