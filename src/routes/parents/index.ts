import * as express from "express";
import { guard } from "../../middlewares/guard";
import { UserRole } from "../../utils/constants/role.constant";
import { CourseRouter } from "./routes/course.route";
import { ExerciseRouter } from "./routes/exercise.route";
import { ParentRouter } from "./routes/personal.route";
import { TimetableRouter } from "./routes/timetable.route";

const router = express.Router();

router.use(guard([UserRole.PARENT]));
router.use("/personal", ParentRouter);
router.use("/timetable", TimetableRouter);
router.use("/course", CourseRouter);
router.use("/exercise", ExerciseRouter);

export default router;