import { Fee } from "../../entities/Fee";
import Pageable from "../helpers/pageable";


export default interface FeeRepository {
  findFeeByBranch: (branchId: number, pageable: Pageable, fromDate?: Date, toDate?: Date) => Promise<Fee[]>;

  countFeeByBranch: (branchId: number, fromDate?: Date, toDate?: Date) => Promise<number>;
}