import * as express from "express";
import moment = require("moment");
import { TeacherService } from "../../../services/teacher";
import { PageableMapper } from "../mappers";
const router = express.Router();


router.post("/", async (req: any, res: any, next: any) => {
  try {
    const pageableDto = PageableMapper.mapToDto(req.body);
    const startDate = moment(req.body.startDate).toDate();
    const endDate = moment(req.body.endDate).toDate();
    const result = await TeacherService.getSchedule(pageableDto, req.user.userId, startDate, endDate);
    return res.status(200).json(result);
  } catch (err) {
    console.log(err);
    next(err);
  }
})

export { router as TeacherScheduleRouter };