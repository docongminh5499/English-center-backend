import * as express from "express";
import * as path from "path";
import * as fs from "fs";
import * as multer from "multer";
import { StudentService } from "../../../services/student";
import { AVATAR_DESTINATION } from "../../../utils/constants/avatar.constant";

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
    console.log("STUDENT PERSONAL INFORMATION ROUTE");
    const userStudent = await StudentService.getPersonalInformation(req.user.userId);
    console.log(userStudent);
    return res.status(200).json(userStudent);
  } catch (err) {
    console.log(err);
    next(err);
  }
});

router.get("/get-parent-list", async (req: any, res: any, next: any) => {
	try {
			console.log("STUDENT PERSONAL GET PARENT LIST ROUTE");
			const userParentList = await StudentService.getParentList(req.query.searchValue);
			console.log("============================================");
			console.log(userParentList);
			return res.status(200).json(userParentList);
	} catch (err) {
			console.log(err);
			next(err);
	}
});

router.post("/add-parent", async (req: any, res: any, next: any) => {
	try {
			console.log("STUDENT PERSONAL ADD PARENT INFORMATION ROUTE");
			const userParent = await StudentService.addParent(req.user.userId, req.body.parentId);
			console.log("============================================");
			console.log(userParent);
			return res.status(200).json(userParent);
	} catch (err) {
			console.log(err);
			next(err);
	}
});

router.post("/delete-parent", async (req: any, res: any, next: any) => {
	try {
			console.log("STUDENT PERSONAL DELETE PARENT INFORMATION ROUTE");
			const success = await StudentService.deleteParent(req.user.userId, req.body.parentId);
			console.log("============================================");
			console.log(success);
			return res.status(200).json(success);
	} catch (err) {
			console.log(err);
			next(err);
	}
});

router.post("/modify-personal-information", upload.single('avatar'), async (req: any, res: any, next: any) => {
  try {
    const result = await StudentService
      .modifyPersonalInformation(req.user.userId, JSON.parse(req.body.userStudent), req.file);
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

router.get("/get-payment-history", async (req: any, res: any, next: any) => {
  try {
    console.log("STUDENT PAYMENT HISTORY ROUTE");
    const result = await StudentService.getPaymentHistory(req.user.userId);
    console.log(result);

    return res.status(200).json(result);
  } catch (err) {
    console.log(err);
    next(err);
  }
});

export { router as StudentPersonalRouter };
