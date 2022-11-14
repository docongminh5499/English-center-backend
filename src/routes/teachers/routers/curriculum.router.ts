import * as express from "express";
import * as multer from "multer";
import * as path from "path";
import * as fs from "fs";
import { TeacherService } from "../../../services/teacher";
import { CURRICULUM_DESTINATION } from "../../../utils/constants/curriculum.constant";
import CurriculumDto from "../../../dto/requests/curriculum.dto";
import { PageableMapper } from "../mappers";

const router = express.Router();
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, CURRICULUM_DESTINATION)
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, "curriculum" + '-' + uniqueSuffix + path.extname(file.originalname))
  }
})
const upload = multer({ storage: storage })



router.get("/get-curriculum", async (req: any, res: any, next: any) => {
  try {
    return res.status(200).json({
      curriculums: await TeacherService.getCurriculumList(req.user.userId)
    });
  } catch (err) {
    console.log(err);
    next(err);
  }
})


router.get("/get-curriculum/:curriculumId", async (req: any, res: any, next: any) => {
  try {
    return res.status(200).json(
      await TeacherService.getCurriculum(req.user.userId, req.params.curriculumId)
    );
  } catch (err) {
    console.log(err);
    next(err);
  }
})




router.post("/create-curriculum", upload.single("image"), async (req: any, res: any, next: any) => {
  try {
    const curriculumDto = new CurriculumDto();
    curriculumDto.curriculum = JSON.parse(req.body.curriculum);
    curriculumDto.imageFile = req.file;

    const result = await TeacherService.createCurriculum(req.user.userId, curriculumDto);
    if (result == null && req.file && req.file.filename) {
      const filePath = path.join(process.cwd(), CURRICULUM_DESTINATION, req.file.filename);
      fs.unlinkSync(filePath);
    }
    return res.status(200).json({
      success: result !== null,
      curriculum: result
    });
  } catch (err) {
    if (req.file && req.file.filename) {
      const filePath = path.join(process.cwd(), CURRICULUM_DESTINATION, req.file.filename);
      fs.unlinkSync(filePath);
    }
    console.log(err);
    next(err);
  }
})




router.post("/modify-curriculum", upload.single("image"), async (req: any, res: any, next: any) => {
  try {
    const curriculumDto = new CurriculumDto();
    curriculumDto.curriculum = JSON.parse(req.body.curriculum);
    curriculumDto.imageFile = req.file;

    const result = await TeacherService.modifyCurriculum(req.user.userId, curriculumDto);
    if (result == null && req.file && req.file.filename) {
      const filePath = path.join(process.cwd(), CURRICULUM_DESTINATION, req.file.filename);
      fs.unlinkSync(filePath);
    }
    return res.status(200).json({
      success: result !== null,
      curriculum: result
    });
  } catch (err) {
    if (req.file && req.file.filename) {
      const filePath = path.join(process.cwd(), CURRICULUM_DESTINATION, req.file.filename);
      fs.unlinkSync(filePath);
    }
    console.log(err);
    next(err);
  }
})



router.delete("/delete-curriculum/:curriculumId", async (req: any, res: any, next: any) => {
  try {
    return res.status(200).json({
      success: await TeacherService.deleteCurriculum(req.user.userId, req.params.curriculumId)
    });
  } catch (err) {
    console.log(err);
    next(err);
  }
})



router.get("/get-prefered-curriculums", async (req: any, res: any, next: any) => {
  try {
    return res.status(200).json(await TeacherService.getPreferedCurriculums(req.user.userId));
  } catch (err) {
    console.log(err);
    next(err);
  }
})





router.post("/check-prefered-curriculums", async (req: any, res: any, next: any) => {
  try {
    return res.status(200).json(
      await TeacherService.getCheckPreferredCurriculum(req.user.userId, req.body.curriculumId));
  } catch (err) {
    console.log(err);
    next(err);
  }
})


router.post("/add-prefered-curriculums", async (req: any, res: any, next: any) => {
  try {
    return res.status(200).json(
      await TeacherService.addPreferredCurriculum(req.user.userId, req.body.teacherId, req.body.curriculumId));
  } catch (err) {
    console.log(err);
    next(err);
  }
})


router.post("/remove-prefered-curriculums", async (req: any, res: any, next: any) => {
  try {
    return res.status(200).json(
      await TeacherService.removePreferredCurriculum(req.user.userId, req.body.teacherId, req.body.curriculumId));
  } catch (err) {
    console.log(err);
    next(err);
  }
})



router.get("/get-curriculum-tags", async (req: any, res: any, next: any) => {
  try {
    return res.status(200).json(await TeacherService.getCurriculumTags(req.user.userId));
  } catch (err) {
    console.log(err);
    next(err);
  }
})


router.post("/get-teachers-by-prefered-curriculum", async (req: any, res: any, next: any) => {
  try {
    const pageableDto = PageableMapper.mapToDto(req.body);
    const result = await TeacherService.getTeachersByPreferedCurriculum(req.user.userId, req.body.curriculumId, pageableDto, req.body.query)
    return res.status(200).json(result);
  } catch (err) {
    console.log(err);
    next(err);
  }
})


router.post("/get-teachers-by-branch-and-not-prefered-curriculum", async (req: any, res: any, next: any) => {
  try {
    const pageableDto = PageableMapper.mapToDto(req.body);
    const result = await TeacherService.getTeacherAddPreferedCurriculum(req.user.userId, req.body.query, pageableDto);
    return res.status(200).json(result);
  } catch (err) {
    console.log(err);
    next(err);
  }
})



export { router as TeacherCurriculumRouter };