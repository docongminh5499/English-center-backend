import * as express from "express";
import { ParentService } from "../../../services/parent";
import { PageableMapper } from "../../teachers/mappers";
import CourseQueryable from "../queryables/course.queryable";

const router = express.Router();

router.get("/get-pageable-student-courses", async (req: any, res: any, next: any) => {
    try {

        // TODO: Admin get all courses, not depending on teacher id
        console.log("PARENT GET COURSE");
        console.log(req.query)
        const pageableDto = PageableMapper.mapToDto(req.query);
        const queryable = new CourseQueryable().map(req.query);
        const courseListDto = await ParentService.getPagecbleStudentCourses(req.query.studentId, pageableDto, queryable);
        console.log(courseListDto);
        return res.status(200).json(courseListDto);
      } catch (err) {
        console.log(err);
        next(err);
      }
});

router.get("/get-course/:courseSlug", async (req: any, res: any, next: any) => {
  try {
      // TODO: Admin get all courses, not depending on teacher id
      console.log("PARENT GET COURSE DETAIL");
      const course = await ParentService.getCourseDetail(req.query.studentId, req.params.courseSlug);
      console.log(course);
      console.log(req.query.studentId);
      return res.status(200).json(course);
    } catch (err) {
      console.log(err);
      next(err);
    }
});

router.get("/attendance-course/:courseSlug", async (req: any, res: any, next: any) => {
  try {

      // TODO: Admin get all courses, not depending on teacher id
      console.log("PARENT ATTENDANCE ROUTE");
      const studentId = req.query.studentId;
      const courseSlug = req.params.courseSlug;
      // console.log(req.params.courseSlug);
      const result = await ParentService.getAttendance(studentId, courseSlug);
      return res.status(200).json(result);
    } catch (err) {
      console.log(err);
      next(err);
    }
});

export { router as CourseRouter };