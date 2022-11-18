import moment = require("moment");
import { Salary } from "../../entities/Salary";
import Pageable from "../helpers/pageable";
import SalaryRepositoryInterface from "./salary.repository.interface";

class SalaryRepositoryImpl implements SalaryRepositoryInterface {
  async findSalaryByUserId(userId: number, pageable: Pageable, fromDate?: Date | undefined, toDate?: Date | undefined): Promise<Salary[]> {
    let queryStmt = Salary.createQueryBuilder("s")
      .setLock("pessimistic_read")
      .useTransaction(true)
      .leftJoinAndSelect("s.transCode", "transCode")
      .leftJoinAndSelect("s.worker", "worker")
      .leftJoinAndSelect("worker.user", "user")
      .leftJoinAndSelect("transCode.userEmployee", "userEmployee")
      .leftJoinAndSelect("userEmployee.worker", "userEmployeeWorker")
      .leftJoinAndSelect("userEmployeeWorker.user", "userEmployeeUser")
      .where("user.id = :userId", { userId })
      .orderBy("transCode.payDate", "DESC");
    if (fromDate !== undefined && fromDate !== null)
      queryStmt = queryStmt.andWhere("transCode.payDate >= :fromDate", { fromDate: moment(fromDate).format("YYYY-MM-DD") })
    if (toDate !== undefined && toDate !== null)
      queryStmt = queryStmt.andWhere("transCode.payDate <= :toDate", { toDate: moment(toDate).format("YYYY-MM-DD") })
    queryStmt = pageable.buildQuery(queryStmt);
    return await queryStmt.getMany();
  }


  async countSalaryByUserId(userId: number, fromDate?: Date | undefined, toDate?: Date | undefined): Promise<number> {
    let queryStmt = Salary.createQueryBuilder("s")
      .setLock("pessimistic_read")
      .useTransaction(true)
      .leftJoinAndSelect("s.transCode", "transCode")
      .leftJoinAndSelect("s.worker", "worker")
      .leftJoinAndSelect("worker.user", "user")
      .where("user.id = :userId", { userId });
    if (fromDate !== undefined && fromDate !== null)
      queryStmt = queryStmt.andWhere("transCode.payDate >= :fromDate", { fromDate: moment(fromDate).format("YYYY-MM-DD") })
    if (toDate !== undefined && toDate !== null)
      queryStmt = queryStmt.andWhere("transCode.payDate <= :toDate", { toDate: moment(toDate).format("YYYY-MM-DD") })
    return await queryStmt.getCount();
  }


  async findSalaryByBranch(branchId: number, pageable: Pageable, fromDate?: Date, toDate?: Date): Promise<Salary[]> {
    let queryStmt = Salary.createQueryBuilder("s")
      .setLock("pessimistic_read")
      .useTransaction(true)
      .leftJoinAndSelect("s.transCode", "transCode")
      .leftJoinAndSelect("transCode.branch", "branch")
      .leftJoinAndSelect("s.worker", "worker")
      .leftJoinAndSelect("worker.user", "user")
      .leftJoinAndSelect("transCode.userEmployee", "userEmployee")
      .leftJoinAndSelect("userEmployee.worker", "userEmployeeWorker")
      .leftJoinAndSelect("userEmployeeWorker.user", "userEmployeeUser")
      .where("branch.id = :branchId", { branchId })
      .orderBy("transCode.payDate", "DESC");
    if (fromDate !== undefined && fromDate !== null)
      queryStmt = queryStmt.andWhere("transCode.payDate >= :fromDate", { fromDate: moment(fromDate).format("YYYY-MM-DD") })
    if (toDate !== undefined && toDate !== null)
      queryStmt = queryStmt.andWhere("transCode.payDate <= :toDate", { toDate: moment(toDate).format("YYYY-MM-DD") })
    queryStmt = pageable.buildQuery(queryStmt);
    return await queryStmt.getMany();
  }


  async countSalaryByBranch(branchId: number, fromDate?: Date, toDate?: Date): Promise<number> {
    let queryStmt = Salary.createQueryBuilder("s")
      .setLock("pessimistic_read")
      .useTransaction(true)
      .leftJoinAndSelect("s.transCode", "transCode")
      .leftJoinAndSelect("transCode.branch", "branch")
      .where("branch.id = :branchId", { branchId });
    if (fromDate !== undefined && fromDate !== null)
      queryStmt = queryStmt.andWhere("transCode.payDate >= :fromDate", { fromDate: moment(fromDate).format("YYYY-MM-DD") })
    if (toDate !== undefined && toDate !== null)
      queryStmt = queryStmt.andWhere("transCode.payDate <= :toDate", { toDate: moment(toDate).format("YYYY-MM-DD") })
    return await queryStmt.getCount();
  }
}


const SalaryRepository = new SalaryRepositoryImpl();
export default SalaryRepository;