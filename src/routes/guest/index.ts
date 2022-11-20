import * as express from "express";
import { GuestService } from "../../services/guest";
import { PageableMapper } from "./mappers";
const router = express.Router();


router.post("/get-courses", async (req: any, res: any, next: any) => {
  try {
    const pageableDto = PageableMapper.mapToDto(req.body);
    const result = await GuestService.getCourses(pageableDto, req.body.level, req.body.curriculumTag, req.body.branchId);
    return res.status(200).json(result);
  } catch (err) {
    console.log(err);
    next(err);
  }
});


router.get("/get-student-count", async (req: any, res: any, next: any) => {
  try {
    const result = await GuestService.getStudentCount();
    return res.status(200).json(result);
  } catch (err) {
    console.log(err);
    next(err);
  }
});



router.get("/get-completed-course-count", async (req: any, res: any, next: any) => {
  try {
    const result = await GuestService.getCompletedCourseCount();
    return res.status(200).json(result);
  } catch (err) {
    console.log(err);
    next(err);
  }
});


router.get("/get-curriculum-tags", async (req: any, res: any, next: any) => {
  try {
    const result = await GuestService.getCurriculumTags();
    return res.status(200).json(result);
  } catch (err) {
    console.log(err);
    next(err);
  }
});



router.get("/get-branches", async (req: any, res: any, next: any) => {
  try {
    const result = await GuestService.getBranches();
    return res.status(200).json(result);
  } catch (err) {
    console.log(err);
    next(err);
  }
});



router.get("/get-top-comments", async (req: any, res: any, next: any) => {
  try {
    const result = await GuestService.getTopComments();
    return res.status(200).json(result);
  } catch (err) {
    console.log(err);
    next(err);
  }
});



router.post("/get-course-detail", async (req: any, res: any, next: any) => {
  try {
    const result = await GuestService.getCourseDetail(req.body.courseSlug);
    return res.status(200).json(result);
  } catch (err) {
    console.log(err);
    next(err);
  }
});




export default router;
