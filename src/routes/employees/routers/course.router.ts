import * as express from "express";
import * as multer from "multer";
import * as path from "path";
import * as fs from "fs";
import { EmployeeService } from "../../../services/employee";
import { COURSE_DESTINATION } from "../../../utils/constants/course.constant";
import CreateCourseDtoMapper from "../mappers/createCourse.mapper";
import PageableMapper from "../mappers/pageable.mapper";
import CourseQueryable from "../queryables/course.queryable";
import StudySessionMapper from "../mappers/studySession.mapper";

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
      req.body.beginingDate,
      req.body.closingDate,
      req.body.courseSlug,
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
      req.body.branchId,
      req.body.closingDate,
      req.body.courseSlug,
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
      req.body.branchId,
      req.body.closingDate,
      req.body.courseSlug,
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
    const result = await EmployeeService.getStudySessions(req.user.userId, req.body.courseSlug, pageableDto, req.body.query);
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


router.post("/modify-course", upload.single('image'), async (req: any, res: any, next: any) => {
  try {
    const createCourseDto = CreateCourseDtoMapper.mapToDto({ ...req.body, file: req.file });
    const result = await EmployeeService.modifyCourse(req.user.userId, req.body.courseSlug, createCourseDto);
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

router.post("/reopen-course", async (req: any, res: any, next: any) => {
  try {
    return res.status(200).json(await EmployeeService.repoenCourse(req.user.userId, req.body.courseSlug));
  } catch (err) {
    console.log(err);
    next(err);
  }
});



router.post("/close-course", async (req: any, res: any, next: any) => {
  try {
    return res.status(200).json(await EmployeeService.closeCourse(req.user.userId, req.body.courseSlug));
  } catch (err) {
    console.log(err);
    next(err);
  }
});


router.post("/lock-course", async (req: any, res: any, next: any) => {
  try {
    const result = await EmployeeService.lockCourse(req.user.userId, req.body.courseSlug);
    return res.status(200).json(result);
  } catch (err) {
    console.log(err);
    next(err);
  }
});



router.post("/unlock-course", async (req: any, res: any, next: any) => {
  try {
    const result = await EmployeeService.unLockCourse(req.user.userId, req.body.courseSlug);
    return res.status(200).json(result);
  } catch (err) {
    console.log(err);
    next(err);
  }
});



router.post("/get-shifts", async (req: any, res: any, next: any) => {
  try {
    return res.status(200).json(await EmployeeService.getShifts(req.body.date));
  } catch (err) {
    console.log(err);
    next(err);
  }
})




router.post("/get-available-teachers-in-date", async (req: any, res: any, next: any) => {
  try {
    const result = await EmployeeService.getAvailableTeachersInDate(
      req.user.userId,
      req.body.date,
      req.body.shiftIds,
      req.body.studySession,
      req.body.curriculumId,
      req.body.branchId
    );
    return res.status(200).json(result);
  } catch (err) {
    console.log(err);
    next(err);
  }
})


router.post("/get-available-tutors-in-date", async (req: any, res: any, next: any) => {
  try {
    const result = await EmployeeService.getAvailableTutorsInDate(
      req.user.userId,
      req.body.date,
      req.body.shiftIds,
      req.body.studySession,
      req.body.branchId
    );
    return res.status(200).json(result);
  } catch (err) {
    console.log(err);
    next(err);
  }
})


router.post("/get-available-classrooms-in-date", async (req: any, res: any, next: any) => {
  try {
    const result = await EmployeeService.getAvailableClassroomInDate(
      req.user.userId,
      req.body.date,
      req.body.shiftIds,
      req.body.studySession,
      req.body.branchId
    );
    return res.status(200).json(result);
  } catch (err) {
    console.log(err);
    next(err);
  }
})


router.post("/add-study-session", async (req: any, res: any, next: any) => {
  try {
    const studySessionDto = StudySessionMapper.mapToDto(req.body);
    const result = await EmployeeService.addStudySession(req.user.userId, req.body.courseSlug, studySessionDto);
    return res.status(200).json(result);
  } catch (err) {
    console.log(err);
    next(err);
  }
})



router.post("/update-study-session", async (req: any, res: any, next: any) => {
  try {
    const studySessionDto = StudySessionMapper.mapToDto(req.body);
    const result = await EmployeeService.updateStudySession(req.user.userId, studySessionDto);
    return res.status(200).json(result);
  } catch (err) {
    console.log(err);
    next(err);
  }
})


router.post("/get-available-student-count", async (req: any, res: any, next: any) => {
  try {
    const result = await EmployeeService.getAvaiableStudentCount(
      req.user.userId, req.body.studySessionId, req.body.courseSlug, req.body.date, req.body.shiftIds);
    return res.status(200).json(result);
  } catch (err) {
    console.log(err);
    next(err);
  }
});


router.post("/remove-study-session", async (req: any, res: any, next: any) => {
  try {
    const result = await EmployeeService.removeStudySession(req.user.userId, req.body.studySessionId);
    return res.status(200).json(result);
  } catch (err) {
    console.log(err);
    next(err);
  }
});


router.post("/remove-course", async (req: any, res: any, next: any) => {
  try {
    const result = await EmployeeService.removeCourse(req.user.userId, req.body.courseSlug);
    return res.status(200).json(result);
  } catch (err) {
    console.log(err);
    next(err);
  }
});


router.post("/get-students", async (req: any, res: any, next: any) => {
  try {
    const pageableDto = PageableMapper.mapToDto(req.body);
    const result = await EmployeeService.getStudentsParicipateCourse(req.user.userId, req.body.courseSlug, req.body.query, pageableDto);
    return res.status(200).json(result);
  } catch (err) {
    console.log(err);
    next(err);
  }
});



router.post("/get-left-money-amount", async (req: any, res: any, next: any) => {
  try {
    const result = await EmployeeService.getFeeAmount(req.user.userId, req.body.courseSlug, req.body.studentId);
    return res.status(200).json(result);
  } catch (err) {
    console.log(err);
    next(err);
  }
})



router.post("/check-student-participate-course", async (req: any, res: any, next: any) => {
  try {
    const result = await EmployeeService.checkStudentParticipateCourse(req.user.userId, req.body.courseSlug, req.body.studentId);
    return res.status(200).json(result);
  } catch (err) {
    console.log(err);
    next(err);
  }
})



router.post("/add-participation", async (req: any, res: any, next: any) => {
  try {
    const result = await EmployeeService.addStudentParticipateCourse(req.user.userId, req.body.courseSlug, req.body.studentId);
    return res.status(200).json(result);
  } catch (err) {
    console.log(err);
    next(err);
  }
})



router.post("/remove-participation", async (req: any, res: any, next: any) => {
  try {
    const result = await EmployeeService.removeStudentParticipateCourse(req.user.userId, req.body.courseSlug, req.body.studentId);
    return res.status(200).json(result);
  } catch (err) {
    console.log(err);
    next(err);
  }
})


export { router as CourseRouter };