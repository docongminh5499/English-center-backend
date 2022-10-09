import * as express from "express";
import { guard } from "../../middlewares/guard";
import { UserRole } from "../../utils/constants/role.constant";
import { CourseRouter } from "./routers/course.router";
import { TeacherPersonalRouter } from "./routers/personal.router";

const router = express.Router();

router.use(guard([UserRole.TEACHER]));
router.use("/courses", CourseRouter);
router.use("/personal", TeacherPersonalRouter);

export default router;
