import { Refund } from "../../entities/Refund";
import Pageable from "../helpers/pageable";


export default interface RefundRepository {
  findRefundByBranch: (branchId: number, pageable: Pageable, fromDate?: Date, toDate?: Date) => Promise<Refund[]>;

  countRefundByBranch: (branchId: number, fromDate?: Date, toDate?: Date) => Promise<number>;
}