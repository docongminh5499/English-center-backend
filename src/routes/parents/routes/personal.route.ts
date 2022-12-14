import * as express from "express";
import * as path from "path";
import * as fs from "fs";
import * as multer from "multer";
import { ParentService } from "../../../services/parent";
import { AVATAR_DESTINATION } from "../../../utils/constants/avatar.constant";

const router = express.Router();
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, AVATAR_DESTINATION);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "avatar" + "-" + uniqueSuffix + path.extname(file.originalname));
  },
});
const upload = multer({ storage: storage });

router.get(
  "/get-personal-infomation",
  async (req: any, res: any, next: any) => {
    try {
      // console.log("AAA");
      const userParent = await ParentService.getUserParent(req.user.userId);
      // console.log(userParent);
      return res.status(200).json(userParent);
    } catch (err) {
      console.log(err);
      next(err);
    }
  }
);

router.post(
  "/modify-personal-information",
  upload.single("avatar"),
  async (req: any, res: any, next: any) => {
    try {
      const result = await ParentService.modifyPersonalInformation(
        req.user.userId,
        JSON.parse(req.body.userParent),
        req.file
      );
      if (result === null && req.file && req.file.filename) {
        const filePath = path.join(
          process.cwd(),
          AVATAR_DESTINATION,
          req.file.filename
        );
        fs.unlinkSync(filePath);
      }
      return res
        .status(200)
        .json({ success: result !== null, token: result?.token });
    } catch (err) {
      if (req.file && req.file.filename) {
        const filePath = path.join(
          process.cwd(),
          AVATAR_DESTINATION,
          req.file.filename
        );
        fs.unlinkSync(filePath);
      }
      console.log(err);
      next(err);
    }
  }
);

router.get("/get-student-payment-history", async (req: any, res: any, next: any) => {
  try {
    // console.log("PARENT PAYMENT HISTORY ROUTE");
    const result = await ParentService.getStudentPaymentHistory(
      req.query.studentId,
      req.query.limit,
      req.query.skip
    );
    // console.log(result);
    return res.status(200).json(result);
  } catch (err) {
    console.log(err);
    next(err);
  }
});

export { router as ParentRouter };
