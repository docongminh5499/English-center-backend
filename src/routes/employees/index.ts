import * as express from "express";
import { guard } from "../../middlewares/guard";
import { UserRole } from "../../utils/constants/role.constant";
import { CourseRouter } from "./routers/course.router";
import { EmployeeCurriculumRouter } from "./routers/curriculum.router";
import { EmployeePersonalRouter } from "./routers/personal.router";

const router = express.Router();

router.use(guard([UserRole.EMPLOYEE]));
router.use("/courses", CourseRouter);
router.use("/personal", EmployeePersonalRouter)
router.use("/curriculum", EmployeeCurriculumRouter)

export default router;