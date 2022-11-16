import { Salary } from "../../entities/Salary";
import Pageable from "../helpers/pageable";


export default interface SalaryRepository {
  findSalaryByUserId: (userId: number, pageable: Pageable, fromDate?: Date, toDate?: Date) => Promise<Salary[]>;

  countSalaryByUserId: (userId: number, fromDate?: Date, toDate?: Date) => Promise<number>;
}