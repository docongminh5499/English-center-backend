import * as express from "express";
import { guard } from "../../middlewares/guard";
import { UserRole } from "../../utils/constants/role.constant";
import { CourseRouter } from "./routers/course.router";

const router = express.Router();

router.use(guard([UserRole.EMPLOYEE]));
router.use("/courses", CourseRouter);

export default router;