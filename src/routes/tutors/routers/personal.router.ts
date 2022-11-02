import * as express from "express";
import * as multer from "multer";
import * as path from "path";
import * as fs from "fs";
import { TutorService } from "../../../services/tutor";
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


router.get("/get-all-shifts", async (req: any, res: any, next: any) => {
    try {
        const courseListDto = await TutorService.getAllShifts(req.user.userId);
        return res.status(200).json(courseListDto);
    } catch (err) {
        console.log(err);
        next(err);
    }
});


router.get("/get-free-shifts", async (req: any, res: any, next: any) => {
    try {
        const courseListDto = await TutorService.getFreeShifts(req.user.userId);
        return res.status(200).json(courseListDto);
    } catch (err) {
        console.log(err);
        next(err);
    }
});


router.post("/update-free-shifts", async (req: any, res: any, next: any) => {
    try {
        await TutorService.updateFreeShifts(req.user.userId, req.body.shiftIds);
        return res.status(200).json();
    } catch (err) {
        console.log(err);
        next(err);
    }
});


router.get("/get-personal-information", async (req: any, res: any, next: any) => {
    try {
        return res.status(200).json(await TutorService.getPersonalInformation(req.user.userId));
    } catch (err) {
        console.log(err);
        next(err);
    }
});



router.post("/modify-personal-information", upload.single('avatar'), async (req: any, res: any, next: any) => {
    try {
        const result = await TutorService
            .modifyPersonalInformation(req.user.userId, JSON.parse(req.body.userTutor), req.file);
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

export { router as TutorPersonalRouter };