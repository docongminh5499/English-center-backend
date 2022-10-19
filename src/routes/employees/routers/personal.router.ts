import * as express from "express";
import { EmployeeService } from "../../../services/employee";

const router = express.Router();



router.get("/get-personal-information", async (req: any, res: any, next: any) => {
    try {
      return res.status(200).json(await EmployeeService.getPersonalInformation(req.user.userId));
    } catch (err) {
      console.log(err);
      next(err);
    }
  });



  
export { router as EmployeePersonalRouter };