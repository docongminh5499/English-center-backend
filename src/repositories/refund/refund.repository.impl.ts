import moment = require("moment");
import { Refund } from "../../entities/Refund";
import Pageable from "../helpers/pageable";
import RefundRepositoryInterface from "./refund.repository.interface";

class RefundRepositoryImpl implements RefundRepositoryInterface {
  async findRefundByBranch(branchId: number, pageable: Pageable, fromDate?: Date, toDate?: Date): Promise<Refund[]> {
    let queryStmt = Refund.createQueryBuilder("s")
      .setLock("pessimistic_read")
      .useTransaction(true)
      .leftJoinAndSelect("s.transCode", "transCode")
      .leftJoinAndSelect("transCode.branch", "branch")
      .leftJoinAndSelect("s.fee", "fee")
      .leftJoinAndSelect("fee.userStudent", "userStudent")
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


  async countRefundByBranch(branchId: number, fromDate?: Date, toDate?: Date): Promise<number> {
    let queryStmt = Refund.createQueryBuilder("s")
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


const RefundRepository = new RefundRepositoryImpl();
export default RefundRepository;