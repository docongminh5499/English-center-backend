import * as express from "express";
import { TutorService } from "../../../services/tutor";
import { PageableMapper } from "../mappers";
import CourseQueryable from "../queryables/course.queryable";
const router = express.Router();


router.get("/get-course", async (req: any, res: any, next: any) => {
  try {
    const pageableDto = PageableMapper.mapToDto(req.query);
    const queryable = new CourseQueryable().map(req.query);
    const courseListDto = await TutorService.getCoursesByTutor(req.user.userId, pageableDto, queryable);
    return res.status(200).json(courseListDto);
  } catch (err) {
    console.log(err);
    next(err);
  }
});


router.get("/get-course/:courseSlug", async (req: any, res: any, next: any) => {
  try {
    return res.status(200).json(await TutorService.getCourseDetail(
      req.user.userId,
      req.params.courseSlug
    ));
  } catch (err) {
    console.log(err);
    next(err);
  }
})


router.post("/get-students", async (req: any, res: any, next: any) => {
  try {
    const pageableDto = PageableMapper.mapToDto(req.body);
    const result = await TutorService.getStudents(req.user.userId, req.body.courseSlug, req.body.query, pageableDto);
    return res.status(200).json(result);
  } catch (err) {
    console.log(err);
    next(err);
  }
})



router.post("/get-student-detail", async (req: any, res: any, next: any) => {
  try {
    const result = await TutorService.getStudentDetailsInCourse(
      req.user.userId, req.body.studentId, req.body.courseSlug);
    return res.status(200).json(result);
  } catch (err) {
    console.log(err);
    next(err);
  }
})



router.post("/get-study-sessions", async (req: any, res: any, next: any) => {
  try {
    const pageableDto = PageableMapper.mapToDto(req.body);
    const result = await TutorService.getStudySessions(req.user.userId, req.body.courseSlug, pageableDto);
    return res.status(200).json(result);
  } catch (err) {
    console.log(err);
    next(err);
  }
})



router.post("/get-employee-by-branch", async (req: any, res: any, next: any) => {
  try {
    return res.status(200).json(await TutorService.getEmployeeByBranch(req.user.userId, req.body.branchId));
  } catch (err) {
    console.log(err);
    next(err);
  }
});


router.post("/get-study-session-detail", async (req: any, res: any, next: any) => {
  try {
    const result = await TutorService.getStudySessionDetail(req.user.userId, req.body.studySessionId);
    return res.status(200).json(result);
  } catch (err) {
    console.log(err);
    next(err);
  }
})



router.post("/request-off-study-session", async (req: any, res: any, next: any) => {
  try {
    const result = await TutorService.requestOffStudySession(req.user.userId, req.body.studySessionId, req.body.excuse);
    return res.status(200).json(result);
  } catch (err) {
    console.log(err);
    next(err);
  }
});




export { router as CourseRouter };