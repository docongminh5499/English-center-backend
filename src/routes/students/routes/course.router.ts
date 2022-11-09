import * as express from "express";
import { StudentService } from "../../../services/student";
import { PageableMapper } from "../../teachers/mappers";
import CourseQueryable from "../queryables/course.queryable";


const router = express.Router();

router.get("/get-course", async (req: any, res: any, next: any) => {
  try {

    // TODO: Admin get all courses, not depending on teacher id
    console.log("STUDENT GET COURSE");
    const pageableDto = PageableMapper.mapToDto(req.query);
    const queryable = new CourseQueryable().map(req.query);
    const courseListDto = await StudentService.getCoursesByStudent(req.user.userId, pageableDto, queryable);
    return res.status(200).json(courseListDto);
  } catch (err) {
    console.log(err);
    next(err);
  }
});

router.get("/get-course/:courseSlug", async (req: any, res: any, next: any) => {
  try {
      // TODO: Admin get all courses, not depending on teacher id
      console.log("STUDENT GET COURSE DETAIL");
      const course = await StudentService.getCourseDetail(req.user.userId, req.params.courseSlug);
      // console.log(course);
      return res.status(200).json(course);
    } catch (err) {
      console.log(err);
      next(err);
    }
});

router.post("/assess-course", async (req: any, res: any, next: any) => {
  try {

      // TODO: Admin get all courses, not depending on teacher id
      console.log("STUDENT ASSESS COURSE");
      const content = {
        starPoint: req.body.starPoint,
        isIncognito: req.body.isIncognito,
        comment: req.body.comment,
      };
      console.log(req.body);
      console.log(req.user.userId);
      const result = await StudentService.assessCourse(req.user.userId, req.body.courseId, content );
      return res.status(200).json(result);
    } catch (err) {
      console.log(err);
      next(err);
    }
});

router.get("/attendance-course/:courseSlug", async (req: any, res: any, next: any) => {
  try {

      // TODO: Admin get all courses, not depending on teacher id
      console.log("STUDENT ATTENDANCE ROUTE");
      const studentId = req.user.userId;
      const courseSlug = req.params.courseSlug;
      // console.log(req.params.courseSlug);
      const result = await StudentService.getAttendance(studentId, courseSlug);
      return res.status(200).json(result);
    } catch (err) {
      console.log(err);
      next(err);
    }
});

export { router as CourseRouter };