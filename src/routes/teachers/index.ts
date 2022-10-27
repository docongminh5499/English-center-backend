import * as express from "express";
import { guard } from "../../middlewares/guard";
import { UserRole } from "../../utils/constants/role.constant";
import { CourseRouter } from "./routers/course.router";
import { TeacherCurriculumRouter } from "./routers/curriculum.router";
import { TeacherPersonalRouter } from "./routers/personal.router";
import { TeacherScheduleRouter } from "./routers/schedule.router";

const router = express.Router();

router.use(guard([UserRole.TEACHER]));
router.use("/courses", CourseRouter);
router.use("/personal", TeacherPersonalRouter);
router.use("/curriculum", TeacherCurriculumRouter);
router.use("/schedule", TeacherScheduleRouter);

export default router;
