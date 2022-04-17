import { User } from "./UserEntity";
import { UserTeacher } from "./UserTeacher";
import { UserTutor } from "./UserTutor";
import { Salary } from "./Salary";
import { UserRole } from "../utils/constants/role.constant";
export declare class UserEmployee extends User {
    id: number;
    roles: UserRole.EMPLOYEE;
    coefficients: number;
    nation: string;
    passport: number;
    domicile: string;
    userTeacher: UserTeacher[];
    userTutor: UserTutor[];
    salary: Salary;
}
