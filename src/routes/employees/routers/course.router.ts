import * as express from "express";
import * as multer from "multer";
import * as path from "path";
import * as fs from "fs";
import { EmployeeService } from "../../../services/employee";
import { COURSE_DESTINATION } from "../../../utils/constants/course.constant";
import CreateCourseDtoMapper from "../mappers/createCourse.mapper";
import PageableMapper from "../mappers/pageable.mapper";
import CourseQueryable from "../queryables/course.queryable";

const router = express.Router();
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, COURSE_DESTINATION)
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, "course" + '-' + uniqueSuffix + path.extname(file.originalname))
  }
})
const upload = multer({ storage: storage })


router.post("/get-teacher-free-shift", async (req: any, res: any, next: any) => {
  try {
    const result = await EmployeeService.getTeacherFreeShifts(
      req.user.userId,
      req.body.teacherId,
      req.body.beginingDate
    );
    return res.status(200).json(result);
  } catch (err) {
    console.log(err);
    next(err);
  }
})


router.post("/get-available-tutors", async (req: any, res: any, next: any) => {
  try {
    const result = await EmployeeService.getAvailableTutors(
      req.user.userId,
      req.body.beginingDate,
      req.body.shiftIds,
      req.body.branchId
    );
    return res.status(200).json(result);
  } catch (err) {
    console.log(err);
    next(err);
  }
})


router.post("/get-available-classrooms", async (req: any, res: any, next: any) => {
  try {
    const result = await EmployeeService.getAvailableClassroom(
      req.user.userId,
      req.body.beginingDate,
      req.body.shiftIds,
      req.body.branchId
    );
    return res.status(200).json(result);
  } catch (err) {
    console.log(err);
    next(err);
  }
})



router.get("/get-branches", async (req: any, res: any, next: any) => {
  try {
    return res.status(200).json(await EmployeeService.getBranches(req.user.userId));
  } catch (err) {
    console.log(err);
    next(err);
  }
})



router.post("/get-teachers", async (req: any, res: any, next: any) => {
  try {
    const result = await EmployeeService.getTeacherByBranchAndPreferedCurriculum(
      req.user.userId,
      req.body.branchId,
      req.body.curriculumId
    );
    return res.status(200).json(result);
  } catch (err) {
    console.log(err);
    next(err);
  }
})


router.get("/get-course", async (req: any, res: any, next: any) => {
  try {
    const pageableDto = PageableMapper.mapToDto(req.query);
    const queryable = new CourseQueryable().map(req.query);
    const courseListDto = await EmployeeService.getCoursesByBranch(req.user.userId, pageableDto, queryable);
    return res.status(200).json(courseListDto);
  } catch (err) {
    console.log(err);
    next(err);
  }
});


router.get("/get-course/:courseSlug", async (req: any, res: any, next: any) => {
  try {
    return res.status(200).json(await EmployeeService.getCourseDetail(req.user.userId, req.params.courseSlug));
  } catch (err) {
    console.log(err);
    next(err);
  }
});


router.post("/get-study-sessions", async (req: any, res: any, next: any) => {
  try {
    const pageableDto = PageableMapper.mapToDto(req.body);
    const result = await EmployeeService.getStudySessions(req.user.userId, req.body.courseSlug, pageableDto);
    return res.status(200).json(result);
  } catch (err) {
    console.log(err);
    next(err);
  }
})


router.post("/create-course", upload.single('image'), async (req: any, res: any, next: any) => {
  try {
    const createCourseDto = CreateCourseDtoMapper.mapToDto({ ...req.body, file: req.file });
    const result = await EmployeeService.createCourse(req.user.userId, createCourseDto);
    if (result === null && req.file && req.file.filename) {
      const filePath = path.join(process.cwd(), COURSE_DESTINATION, req.file.filename);
      fs.unlinkSync(filePath);
    }
    return res.status(200).json({ success: result !== null, course: result });
  } catch (err) {
    if (req.file && req.file.filename) {
      const filePath = path.join(process.cwd(), COURSE_DESTINATION, req.file.filename);
      fs.unlinkSync(filePath);
    }
    console.log(err);
    next(err);
  }
})


export { router as CourseRouter };