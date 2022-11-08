import * as express from "express";
import { guard } from "../../middlewares/guard";
import { UserRole } from "../../utils/constants/role.constant";
import { CourseRouter } from "./routes/course.router";
import { DocumentRouter } from "./routes/document.router";
import { ExerciseRouter } from "./routes/exercise.route";
import { TimetableRouter } from "./routes/timetable.router";

const router = express.Router();

router.use(guard([UserRole.STUDENT]));
router.use("/timetable", TimetableRouter);
router.use("/courses", CourseRouter);
router.use("/exercise", ExerciseRouter);
router.use("/document", DocumentRouter);

export default router;