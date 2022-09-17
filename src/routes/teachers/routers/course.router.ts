import * as express from "express";
import { PageableMapper } from "../mappers";
import { TeacherService } from "../../../services/teacher";
import CourseQueryable from "../queryables/course.queryable";

const router = express.Router();

router.get("/get-course", async (req: any, res: any, next: any) => {
  try {

    // TODO: Admin get all courses, not depending on teacher id
    
    const pageableDto = PageableMapper.mapToDto(req.query);
    const queryable = new CourseQueryable().map(req.query);
    const courseListDto = await TeacherService.getCoursesByTeacher(req.user.id, pageableDto, queryable);
    return res.status(200).json(courseListDto);
  } catch (err) {
    console.log(err);
    next(err);
  }
});

export { router as CourseRouter };
