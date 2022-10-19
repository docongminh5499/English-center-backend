import { UserEmployee } from "../../entities/UserEmployee";

export default interface EmployeeRepository {
    findUserEmployeeByid: (userId: number) => Promise<UserEmployee | null>;
}