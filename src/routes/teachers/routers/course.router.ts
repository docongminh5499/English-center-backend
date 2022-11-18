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


router.post("/get-students", async (req: any, res: any, next: any) => {
  try {
    const pageableDto = PageableMapper.mapToDto(req.body);
    const result = await TeacherService.getStudents(req.user.userId, req.body.courseSlug, req.body.query, pageableDto);
    return res.status(200).json(result);
  } catch (err) {
    console.log(err);
    next(err);
  }
})



router.post("/get-student-detail", async (req: any, res: any, next: any) => {
  try {
    const result = await TeacherService.getStudentDetailsInCourse(
      req.user.userId, req.body.studentId, req.body.courseSlug);
    return res.status(200).json(result);
  } catch (err) {
    console.log(err);
    next(err);
  }
})



router.post("/get-exercises", async (req: any, res: any, next: any) => {
  try {
    const pageableDto = PageableMapper.mapToDto(req.body);
    const result = await TeacherService.getExercises(req.user.userId, req.body.courseSlug, pageableDto);
    return res.status(200).json(result);
  } catch (err) {
    console.log(err);
    next(err);
  }
})



router.post("/get-documents", async (req: any, res: any, next: any) => {
  try {
    const pageableDto = PageableMapper.mapToDto(req.body);
    const result = await TeacherService.getDocuments(req.user.userId, req.body.courseSlug, pageableDto);
    return res.status(200).json(result);
  } catch (err) {
    console.log(err);
    next(err);
  }
})



router.post("/get-comments", async (req: any, res: any, next: any) => {
  try {
    const pageableDto = PageableMapper.mapToDto(req.body);
    const result = await TeacherService.getComment(req.user.userId, req.body.courseSlug, pageableDto);
    return res.status(200).json(result);
  } catch (err) {
    console.log(err);
    next(err);
  }
})



router.post("/get-study-sessions", async (req: any, res: any, next: any) => {
  try {
    const pageableDto = PageableMapper.mapToDto(req.body);
    const result = await TeacherService.getStudySessions(req.user.userId, req.body.courseSlug, pageableDto);
    return res.status(200).json(result);
  } catch (err) {
    console.log(err);
    next(err);
  }
})



router.post("/get-study-session-detail", async (req: any, res: any, next: any) => {
  try {
    const result = await TeacherService.getStudySessionDetail(req.user.userId, req.body.studySessionId);
    return res.status(200).json(result);
  } catch (err) {
    console.log(err);
    next(err);
  }
})



router.post("/modify-study-session-detail", async (req: any, res: any, next: any) => {
  try {
    const result = await TeacherService.modifyStudySessionDetail(
      req.user.userId, req.body.studySession, req.body.attendance, req.body.makeups);
    return res.status(200).json(result);
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
    const result = await TeacherService.createDocument(req.user.userId, documentDto);
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


router.post("/close-course", async (req: any, res: any, next: any) => {
  try {
    return res.status(200).json(await TeacherService.closeCourse(req.user.userId, req.body.courseSlug));
  } catch (err) {
    console.log(err);
    next(err);
  }
});



router.post("/request-off-study-session", async (req: any, res: any, next: any) => {
  try {
    const result = await TeacherService.requestOffStudySession(req.user.userId, req.body.studySessionId, req.body.excuse);
    return res.status(200).json(result);
  } catch (err) {
    console.log(err);
    next(err);
  }
});




export { router as CourseRouter };
