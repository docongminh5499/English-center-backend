import * as express from "express";
import { EmployeeService } from "../../../services/employee";
import PageableMapper from "../mappers/pageable.mapper";

const router = express.Router();


router.post("/get-students", async (req: any, res: any, next: any) => {
  try {
    const pageableDto = PageableMapper.mapToDto(req.body);
    const result = await EmployeeService.getAllStudents(req.user.userId, req.body.query, pageableDto, req.body.checkQuery);
    return res.status(200).json(result);
  } catch (err) {
    console.log(err);
    next(err);
  }
})


router.post("/get-student-detail", async (req: any, res: any, next: any) => {
  try {
    const result = await EmployeeService.getStudentDetails(req.user.userId, req.body.studentId);
    return res.status(200).json(result);
  } catch (err) {
    console.log(err);
    next(err);
  }
});



router.post("/get-parents", async (req: any, res: any, next: any) => {
  try {
    const pageableDto = PageableMapper.mapToDto(req.body);
    const result = await EmployeeService.getAllParents(req.user.userId, req.body.query, pageableDto);
    return res.status(200).json(result);
  } catch (err) {
    console.log(err);
    next(err);
  }
})


router.post("/modify-parent", async (req: any, res: any, next: any) => {
  try {
    const result = await EmployeeService.modifyParent(
      req.user.userId, req.body.parentId, req.body.studentId, req.body.version);
    return res.status(200).json(result);
  } catch (err) {
    console.log(err);
    next(err);
  }
})




export { router as EmployeeStudentRouter };