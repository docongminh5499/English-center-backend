import * as express from "express";
import ShiftRepository from "../../../repositories/shift/shift.repository.impl";

const router = express.Router();


router.get("/test", async (req: any, res: any, next: any) => {
  try {
    return res.status(200)
      .json(await ShiftRepository.findAvailableShiftsOfTeacher(2, new Date(2022, 4, 3)))
  } catch (err) {
    console.log(err);
    next(err);
  }
})


export { router as CourseRouter };