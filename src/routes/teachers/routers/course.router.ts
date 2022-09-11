import * as express from "express";
import { PageableMapper } from "../mappers";
import { TeacherService } from "../../../services/teacher";

const router = express.Router();

router.get("/get-course", async (req: any, res: any, next: any) => {
  try {

    // TODO: Admin get all courses, not depending on teacher id
    
    const pageable = PageableMapper.mapToDto(req.body);
    const courseListDto = await TeacherService.getCoursesByTeacher(req.user.id, pageable);
    return res.status(200).json(courseListDto);
  } catch (err) {
    console.log(err);
    next(err);
  }
});

export { router as CourseRouter };
