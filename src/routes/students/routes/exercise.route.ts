import * as express from "express";
import { StudentService } from "../../../services/student";

const router = express.Router();

router.get("/get-all-exercises", async (req: any, res: any, next: any) => {
    try {
        const courseId = req.query.courseId;
        const exercises = await StudentService.getAllExercises(courseId);
        console.log("=======================================================");
        console.log(exercises);
        return res.status(200).json(exercises);
      } catch (err) {
        console.log(err);
        next(err);
      }
});

router.post("/submit-exercise", async (req: any, res: any, next: any) => {
  try {
      console.log("************************************************");
      console.log(req.body);
      const studentDoExercise = await StudentService.submitExercise(req.user.userId, req.body.exerciseId, req.body.answers);
      console.log(studentDoExercise);
      if(studentDoExercise === null){
        throw new Error("Lỗi hệ thống");
      }
      return res.status(200).json(studentDoExercise);
    } catch (err) {
      console.log(err);
      next(err);
    }
});

router.get("/get-student-do-exercise", async (req: any, res: any, next: any) => {
  try {
      const studentDoExercise = await StudentService.getStudentDoExercise(req.user.userId, req.query.courseId);
      console.log("=======================================================");
      console.log(studentDoExercise);
      return res.status(200).json(studentDoExercise);
    } catch (err) {
      console.log(err);
      next(err);
    }
});

export { router as ExerciseRouter };