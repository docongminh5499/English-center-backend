import * as express from "express";
import * as multer from "multer";
import * as path from "path";
import * as fs from "fs";
import { TeacherService } from "../../../services/teacher";
import { AVATAR_DESTINATION } from "../../../utils/constants/avatar.constant";
import { PageableMapper } from "../mappers";

const router = express.Router();
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, AVATAR_DESTINATION)
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, "avatar" + '-' + uniqueSuffix + path.extname(file.originalname))
  }
})
const upload = multer({ storage: storage })



router.get("/get-personal-information", async (req: any, res: any, next: any) => {
  try {
    return res.status(200).json(await TeacherService.getPersonalInformation(req.user.userId));
  } catch (err) {
    console.log(err);
    next(err);
  }
});



router.post("/modify-personal-information", upload.single('avatar'), async (req: any, res: any, next: any) => {
  try {
    const result = await TeacherService
      .modifyPersonalInformation(req.user.userId, JSON.parse(req.body.userTeacher), req.file);
    if (result === null && req.file && req.file.filename) {
      const filePath = path.join(process.cwd(), AVATAR_DESTINATION, req.file.filename);
      fs.unlinkSync(filePath);
    }
    return res.status(200).json({ success: result !== null, token: result?.token });
  } catch (err) {
    if (req.file && req.file.filename) {
      const filePath = path.join(process.cwd(), AVATAR_DESTINATION, req.file.filename);
      fs.unlinkSync(filePath);
    }
    console.log(err);
    next(err);
  }
});


router.post("/get-salaries", async (req: any, res: any, next: any) => {
  try {
    const pageableDto = PageableMapper.mapToDto(req.body);
    const result = await TeacherService.getPersonalSalaries(req.user.userId, pageableDto, req.body.fromDate, req.body.toDate);
    return res.status(200).json(result);
  } catch (err) {
    console.log(err);
    next(err);
  }
});


export { router as TeacherPersonalRouter };
