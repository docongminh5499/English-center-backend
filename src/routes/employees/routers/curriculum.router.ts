import * as express from "express";
import { EmployeeService } from "../../../services/employee";

const router = express.Router();



router.get("/get-curriculum", async (req: any, res: any, next: any) => {
  try {
    return res.status(200).json({
      curriculums: await EmployeeService.getCurriculumList(req.user.userId)
    });
  } catch (err) {
    console.log(err);
    next(err);
  }
})




export { router as EmployeeCurriculumRouter };