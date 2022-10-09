import * as express from "express";
import { TeacherService } from "../../../services/teacher";

const router = express.Router();

router.get("/get-personal-information", async (req: any, res: any, next: any) => {
  try {
    return res.status(200).json(await TeacherService.getPersonalInformation(req.user.userId));
  } catch (err) {
    console.log(err);
    next(err);
  }
});


export { router as TeacherPersonalRouter };
