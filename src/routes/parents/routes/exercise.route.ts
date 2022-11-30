import * as express from "express";
import { ParentService } from "../../../services/parent";

const router = express.Router();

router.get("/get-all-exercises", async (req: any, res: any, next: any) => {
    try {
        const courseId = req.query.courseId;
        const exercises = await ParentService.getAllExercises(courseId);
        console.log("=======================================================");
        console.log(exercises);
        return res.status(200).json(exercises);
      } catch (err) {
        console.log(err);
        next(err);
      }
});

router.get("/get-student-do-exercise", async (req: any, res: any, next: any) => {
  try {
      const studentDoExercise = await ParentService.getStudentDoExercise(req.query.studentId, req.query.courseId);
      console.log("=======================================================");
      console.log(studentDoExercise);
      return res.status(200).json(studentDoExercise);
    } catch (err) {
      console.log(err);
      next(err);
    }
});

export { router as ExerciseRouter };