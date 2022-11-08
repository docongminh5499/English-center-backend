import * as express from "express";
import { EmployeeService } from "../../../services/employee";
import ClassroomMapper from "../mappers/classroomDto.mapper";
import PageableMapper from "../mappers/pageable.mapper";
const router = express.Router();


router.post("/get-classrooms", async (req: any, res: any, next: any) => {
  try {
    const pageableDto = PageableMapper.mapToDto(req.body);
    const result = await EmployeeService.getClassrooms(req.user.userId, pageableDto, req.body.query);
    return res.status(200).json(result);
  } catch (err) {
    console.log(err);
    next(err);
  }
});


router.post("/add-classroom", async (req: any, res: any, next: any) => {
  try {
    const classroomDto = ClassroomMapper.mapToDto(req.body);
    const result = await EmployeeService.addClassroom(req.user.userId, classroomDto);
    return res.status(200).json(result);
  } catch (err) {
    console.log(err);
    next(err);
  }
});


router.post("/modify-classroom", async (req: any, res: any, next: any) => {
  try {
    const classroomDto = ClassroomMapper.mapToDto(req.body);
    const result = await EmployeeService.modifyClassroom(req.user.userId, classroomDto);
    return res.status(200).json(result);
  } catch (err) {
    console.log(err);
    next(err);
  }
});


router.post("/remove-classroom", async (req: any, res: any, next: any) => {
  try {
    const result = await EmployeeService.removeClassroom(req.user.userId, req.body.name, req.body.branchId);
    return res.status(200).json(result);
  } catch (err) {
    console.log(err);
    next(err);
  }
});



export { router as EmployeeClassroomeRouter };