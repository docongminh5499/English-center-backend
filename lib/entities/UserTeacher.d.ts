import { User } from "./UserEntity";
import { UserRole } from "../utils/constants/role.constant";
import { Salary } from "./Salary";
export declare class UserTeacher extends User {
    id: number;
    roles: UserRole.TEACHER;
    coefficients: number;
    nation: string;
    passport: number;
    domicile: string;
    salary: Salary;
}
