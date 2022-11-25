import * as express from "express";
import { EmployeeService } from "../../../services/employee";
import PageableMapper from "../mappers/pageable.mapper";

const router = express.Router();


router.post("/get-employees", async (req: any, res: any, next: any) => {
  try {
    const pageableDto = PageableMapper.mapToDto(req.body);
    const result = await EmployeeService.getEmployeeByBranch(req.user.userId, req.body.query, pageableDto);
    return res.status(200).json(result);
  } catch (err) {
    console.log(err);
    next(err);
  }
});



router.post("/get-teachers", async (req: any, res: any, next: any) => {
  try {
    const pageableDto = PageableMapper.mapToDto(req.body);
    const result = await EmployeeService.getTeacherByBranch(req.user.userId, req.body.query, pageableDto);
    return res.status(200).json(result);
  } catch (err) {
    console.log(err);
    next(err);
  }
});



router.post("/get-tutors", async (req: any, res: any, next: any) => {
  try {
    const pageableDto = PageableMapper.mapToDto(req.body);
    const result = await EmployeeService.getTutorByBranch(req.user.userId, req.body.query, pageableDto);
    return res.status(200).json(result);
  } catch (err) {
    console.log(err);
    next(err);
  }
});



router.post("/create-salary", async (req: any, res: any, next: any) => {
  try {
    EmployeeService.createSalary(req.user.userId);
    return res.status(200).json(true);
  } catch (err) {
    console.log(err);
    next(err);
  }
});



export { router as EmployeeWorkerRouter };