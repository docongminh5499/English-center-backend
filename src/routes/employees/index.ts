import * as express from "express";
import { guard } from "../../middlewares/guard";
import { UserRole } from "../../utils/constants/role.constant";
import { EmployeeClassroomeRouter } from "./routers/classroom.router";
import { CourseRouter } from "./routers/course.router";
import { EmployeeCurriculumRouter } from "./routers/curriculum.router";
import { EmployeePersonalRouter } from "./routers/personal.router";
import { EmployeeStudentRouter } from "./routers/student.router";
import { EmployeeTransactionRouter } from "./routers/transaction.router";
import { EmployeeWorkerRouter } from "./routers/worker.router";

const router = express.Router();

router.use(guard([UserRole.EMPLOYEE]));
router.use("/courses", CourseRouter);
router.use("/personal", EmployeePersonalRouter)
router.use("/curriculum", EmployeeCurriculumRouter)
router.use("/classroom", EmployeeClassroomeRouter)
router.use("/student", EmployeeStudentRouter)
router.use("/transaction", EmployeeTransactionRouter)
router.use("/workers", EmployeeWorkerRouter)

export default router;