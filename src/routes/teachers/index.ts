import * as express from "express";
import { guard } from "../../middlewares/guard";
import { UserRole } from "../../utils/constants/role.constant";
import { CourseRouter } from "./course";

const router = express.Router();

router.use(guard([UserRole.TEACHER, UserRole.ADMIN]));
router.use("/courses", CourseRouter);

export default router;
