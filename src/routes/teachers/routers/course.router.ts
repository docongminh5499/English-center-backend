import * as express from "express";
import * as multer from "multer";
import * as path from "path";
import * as fs from "fs";
import { PageableMapper } from "../mappers";
import { TeacherService } from "../../../services/teacher";
import CourseQueryable from "../queryables/course.queryable";
import DocumentMapper from "../mappers/document.mapper";
import { DOCUMENT_DESTINATION } from "../../../utils/constants/document.constant";


const router = express.Router();
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, DOCUMENT_DESTINATION)
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, "document" + '-' + uniqueSuffix + path.extname(file.originalname))
  }
})
const upload = multer({ storage: storage })


router.get("/get-course", async (req: any, res: any, next: any) => {
  try {

    // TODO: Admin get all courses, not depending on teacher id

    const pageableDto = PageableMapper.mapToDto(req.query);
    const queryable = new CourseQueryable().map(req.query);
    const courseListDto = await TeacherService.getCoursesByTeacher(req.user.userId, pageableDto, queryable);
    return res.status(200).json(courseListDto);
  } catch (err) {
    console.log(err);
    next(err);
  }
});


router.get("/get-course/:courseSlug", async (req: any, res: any, next: any) => {
  try {
    return res.status(200).json(await TeacherService.getCourseDetail(
      req.user.userId,
      req.params.courseSlug
    ));
  } catch (err) {
    console.log(err);
    next(err);
  }
})

router.delete("/delete-exercise/:exerciseId", async (req: any, res: any, next: any) => {
  try {
    return res.status(200).json({
      success:
        await TeacherService.deleteExercise(req.user.userId, req.params.exerciseId)
    });
  } catch (err) {
    console.log(err);
    next(err);
  }
})

router.post("/create-document", upload.single('documentFile'), async (req: any, res: any, next: any) => {
  try {
    const documentDto = DocumentMapper.mapToDto({ ...req.body, documentFile: req.file })
    const result = await TeacherService.createDocument(documentDto);
    if (result === null && req.file && req.file.filename) {
      const filePath = path.join(process.cwd(), DOCUMENT_DESTINATION, req.file.filename);
      fs.unlinkSync(filePath);
    }
    return res.status(200).json({ document: result })
  } catch (err) {
    if (req.file && req.file.filename) {
      const filePath = path.join(process.cwd(), DOCUMENT_DESTINATION, req.file.filename);
      fs.unlinkSync(filePath);
    }
    console.log(err);
    next(err);
  }
})


router.delete("/delete-document/:documentId", async (req: any, res: any, next: any) => {
  try {
    return res.status(200).json({
      success:
        await TeacherService.deleteDocument(req.user.userId, req.params.documentId)
    });
  } catch (err) {
    console.log(err);
    next(err);
  }
})

export { router as CourseRouter };
