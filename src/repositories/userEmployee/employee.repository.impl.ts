import { UserEmployee } from "../../entities/UserEmployee";
import EmployeeRepositoryInferface from "./employee.repository.interface";


class EmployeeRepositoryImpl implements EmployeeRepositoryInferface {
  async findUserEmployeeByid(userId: number): Promise<UserEmployee | null> {
    return await UserEmployee.createQueryBuilder("employee")
      .setLock("pessimistic_read")
      .useTransaction(true)
      .leftJoinAndSelect("employee.worker", "worker")
      .leftJoinAndSelect("worker.user", "user")
      .leftJoinAndSelect("worker.branch", "branch")
      .where("user.id = :userId", { userId })
      .getOne();
  }


  async findUserEmployeeByBranch(branchId: number): Promise<UserEmployee[]> {
    return await UserEmployee.createQueryBuilder("employee")
      .setLock("pessimistic_read")
      .useTransaction(true)
      .leftJoinAndSelect("employee.worker", "worker")
      .leftJoinAndSelect("worker.user", "user")
      .leftJoinAndSelect("worker.branch", "branch")
      .where("branch.id = :branchId", { branchId })
      .getMany();
  }
}


const EmployeeRepository = new EmployeeRepositoryImpl();
export default EmployeeRepository;