import * as express from "express";
import { TeacherService } from "../../../services/teacher";

const router = express.Router();

router.post("/create-exercise", async (req: any, res: any, next: any) => {
    try {
      console.log(req.body);
      const exercise = await TeacherService.createExercise(req.body.courseId, req.body.basicInfo, req.body.questions);
      console.log(exercise);
      return res.status(200).json(exercise);
    } catch (err) {
      console.log(err);
      next(err);
    }
});

router.post("/add-new-question-tag", async (req: any, res: any, next: any) => {
  try {
    console.log(req.body.tagName);
    const tag = await TeacherService.addNewQuestionTag(req.body.tagName);
    return res.status(200).json(tag);
  } catch (err) {
    console.log(err);
    next(err);
  }
});

router.get("/get-all-question-tag", async (req: any, res: any, next: any) => {
  try {
    const tags = await TeacherService.getAllQuestionTags();
    return res.status(200).json(tags);
  } catch (err) {
    console.log(err);
    next(err);
  }
});
  
export { router as TeacherExerciseRouter };