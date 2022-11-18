import { Brackets } from "typeorm";
import { UserEmployee } from "../../entities/UserEmployee";
import Pageable from "../helpers/pageable";
import EmployeeRepositoryInferface from "./employee.repository.interface";


class EmployeeRepositoryImpl implements EmployeeRepositoryInferface {
  async findUserEmployeeByid(userId: number): Promise<UserEmployee | null> {
    return await UserEmployee.createQueryBuilder("employee")
      .setLock("pessimistic_read")
      .useTransaction(true)
      .leftJoinAndSelect("employee.worker", "worker")
      .leftJoinAndSelect("worker.user", "user")
      .leftJoinAndSelect("worker.branch", "branch")
      .leftJoinAndSelect("branch.userEmployee", "manager")
      .leftJoinAndSelect("manager.worker", "managerWorker")
      .leftJoinAndSelect("managerWorker.user", "managerUser")
      .leftJoinAndSelect("branch.userTeacher", "teacherManager")
      .leftJoinAndSelect("teacherManager.worker", "teacherManagerWorker")
      .leftJoinAndSelect("teacherManagerWorker.user", "teacherManagerUser")
      .where("user.id = :userId", { userId })
      .getOne();
  }



  async findEmployeeByBranch(branchId: number, pageable: Pageable, query?: string): Promise<UserEmployee[]> {
    let queryStmt = UserEmployee
      .createQueryBuilder("tt")
      .setLock("pessimistic_read")
      .useTransaction(true)
      .leftJoinAndSelect("tt.worker", "worker")
      .leftJoinAndSelect("worker.user", "user")
      .leftJoinAndSelect("worker.branch", "branch")
      .where("branch.id = :branchId", { branchId })
      .orderBy("user.fullName", "ASC");
    if (query !== undefined && query.trim().length > 0)
      queryStmt = queryStmt.andWhere(new Brackets(qb => {
        qb.where("user.fullName LIKE :query", { query: '%' + query + '%' })
          .orWhere("user.id LIKE :query", { query: '%' + query + '%' })
      }));
    queryStmt = pageable.buildQuery(queryStmt);
    return await queryStmt.getMany();
  }


  async countEmployeeByBranch(branchId: number, query?: string): Promise<number> {
    let queryStmt = UserEmployee
      .createQueryBuilder("tt")
      .setLock("pessimistic_read")
      .useTransaction(true)
      .leftJoinAndSelect("tt.worker", "worker")
      .leftJoinAndSelect("worker.user", "user")
      .leftJoinAndSelect("worker.branch", "branch")
      .where("branch.id = :branchId", { branchId });
    if (query !== undefined && query.trim().length > 0)
      queryStmt = queryStmt.andWhere(new Brackets(qb => {
        qb.where("user.fullName LIKE :query", { query: '%' + query + '%' })
          .orWhere("user.id LIKE :query", { query: '%' + query + '%' })
      }));
    return await queryStmt.getCount();
  }
}


const EmployeeRepository = new EmployeeRepositoryImpl();
export default EmployeeRepository;