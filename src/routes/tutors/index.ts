import * as express from "express";
import { guard } from "../../middlewares/guard";
import { UserRole } from "../../utils/constants/role.constant";
import { CourseRouter } from "./routers/course.router";
import { TutorPersonalRouter } from "./routers/personal.router";
import { TutorScheduleRouter } from "./routers/schedule.router";
const router = express.Router();

router.use(guard([UserRole.TUTOR]));
router.use("/courses", CourseRouter);
router.use("/personal", TutorPersonalRouter);
router.use("/schedule", TutorScheduleRouter);
export default router;
