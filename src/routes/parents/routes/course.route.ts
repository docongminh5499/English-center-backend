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

// router.get("/get-course/:courseSlug", async (req: any, res: any, next: any) => {
//   try {
//       // TODO: Admin get all courses, not depending on teacher id
//       console.log("STUDENT GET COURSE DETAIL");
//       const course = await ParentService.getCourseDetail(req.user.userId, req.params.courseSlug);
//       // console.log(course);
//       return res.status(200).json(course);
//     } catch (err) {
//       console.log(err);
//       next(err);
//     }
// });

export { router as CourseRouter };