import { UserEmployee } from "../../entities/UserEmployee";
import Pageable from "../helpers/pageable";

export default interface EmployeeRepository {
    findUserEmployeeByid: (userId: number) => Promise<UserEmployee | null>;
    
    findEmployeeByBranch: (branchId: number, pageable: Pageable, query?: string) => Promise<UserEmployee[]>;

    countEmployeeByBranch: (branchId: number, query?: string) => Promise<number>;
}