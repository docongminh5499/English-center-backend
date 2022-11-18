import * as express from "express";
import { EmployeeService } from "../../../services/employee";
import PageableMapper from "../mappers/pageable.mapper";

const router = express.Router();


router.post("/get-salaries", async (req: any, res: any, next: any) => {
  try {
    const pageableDto = PageableMapper.mapToDto(req.body);
    const result = await EmployeeService.getSalariesByBranch(req.user.userId, pageableDto, req.body.fromDate, req.body.toDate);
    return res.status(200).json(result);
  } catch (err) {
    console.log(err);
    next(err);
  }
});



router.post("/get-fees", async (req: any, res: any, next: any) => {
  try {
    const pageableDto = PageableMapper.mapToDto(req.body);
    const result = await EmployeeService.getFeeByBranch(req.user.userId, pageableDto, req.body.fromDate, req.body.toDate);
    return res.status(200).json(result);
  } catch (err) {
    console.log(err);
    next(err);
  }
});



router.post("/get-refunds", async (req: any, res: any, next: any) => {
  try {
    const pageableDto = PageableMapper.mapToDto(req.body);
    const result = await EmployeeService.getRefundByBranch(req.user.userId, pageableDto, req.body.fromDate, req.body.toDate);
    return res.status(200).json(result);
  } catch (err) {
    console.log(err);
    next(err);
  }
});



export { router as EmployeeTransactionRouter };