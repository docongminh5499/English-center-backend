import * as express from "express";
import { guard } from "../../middlewares/guard";
import { UserRole } from "../../utils/constants/role.constant";
import { TimetableRouter } from "./routers/timetable.router";

const router = express.Router();

router.use(guard([UserRole.STUDENT]));
router.use("/timetable", TimetableRouter);

export default router;