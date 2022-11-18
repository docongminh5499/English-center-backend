import moment = require("moment");
import { Fee } from "../../entities/Fee";
import Pageable from "../helpers/pageable";
import FeeRepositoryInterface from "./fee.repository.interface";

class FeeRepositoryImpl implements FeeRepositoryInterface {
  async findFeeByBranch(branchId: number, pageable: Pageable, fromDate?: Date, toDate?: Date): Promise<Fee[]> {
    let queryStmt = Fee.createQueryBuilder("s")
      .setLock("pessimistic_read")
      .useTransaction(true)
      .leftJoinAndSelect("s.transCode", "transCode")
      .leftJoinAndSelect("transCode.branch", "branch")
      .leftJoinAndSelect("s.userStudent", "userStudent")
      .leftJoinAndSelect("userStudent.user", "user")
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


  async countFeeByBranch(branchId: number, fromDate?: Date, toDate?: Date): Promise<number> {
    let queryStmt = Fee.createQueryBuilder("s")
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


const FeeRepository = new FeeRepositoryImpl();
export default FeeRepository;