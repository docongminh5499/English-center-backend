import * as express from "express";
import * as multer from "multer";
import * as path from "path";
import * as fs from "fs";
import { TeacherService } from "../../../services/teacher";
import { QUESTION_IMAGE_AND_AUDIO_DESTINATION } from "../../../utils/constants/questionImage.constant";

const router = express.Router();
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, QUESTION_IMAGE_AND_AUDIO_DESTINATION)
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, "question_image" + '-' + uniqueSuffix + path.extname(file.originalname))
  }
})
const upload = multer({ storage: storage })

router.post("/create-exercise", async (req: any, res: any, next: any) => {
    try {
      // console.log(req.body);
      // console.log(req.files);
      const exercise = await TeacherService.createExercise(req.body.courseId, req.body.basicInfo, req.body.questions);
      // console.log(exercise);
      return res.status(200).json(exercise);
    } catch (err) {
      console.log(err);
      next(err);
    }
});

router.post("/modify-exercise", async (req: any, res: any, next: any) => {
  try {
    // console.log("=========================================");
    // console.log(req.body);
    const exercise = await TeacherService.modifyExercise(req.body.exerciseId, req.body.basicInfo, req.body.questions,  req.body.deleteQuestions);
    // console.log("*****************************************");
    // console.log(exercise?.questions[0].wrongAnswers);
    return res.status(200).json(exercise);
  } catch (err) {
    console.log(err);
    next(err);
  }
});

router.post("/add-new-question-tag", async (req: any, res: any, next: any) => {
  try {
    // console.log(req.body.tagName);
    const tag = await TeacherService.addNewQuestionTag(req.body.tagName);
    return res.status(200).json(tag);
  } catch (err) {
    console.log(err);
    next(err);
  }
});

router.get("/get-all-question-tag", async (req: any, res: any, next: any) => {
  try {
    const tags = await TeacherService.getAllQuestionTags();
    return res.status(200).json(tags);
  } catch (err) {
    console.log(err);
    next(err);
  }
});

router.get("/get-exercise-by-id", async (req: any, res: any, next: any) => {
  try {
    const exercise = await TeacherService.getExerciseById(req.query.exerciseId);
    return res.status(200).json(exercise);
  } catch (err) {
    console.log(err);
    next(err);
  }
});

router.get("/get-student-exercise-result", async (req: any, res: any, next: any) => {
  try {
    const exercise = await TeacherService.getStdExeResult(req.query.exerciseId);
    return res.status(200).json(exercise);
  } catch (err) {
    console.log(err);
    next(err);
  }
});

router.post("/send-question-image", upload.single("image"), async (req: any, res: any, next: any) => {
  try {
    // console.log("TEACHER SEND IMAGE ROUTE!");
    // console.log(req.body);
    // console.log(req.file);
    const result = await TeacherService.saveQuestionImage(req.body.temporaryKey, req.file);
    // console.log(result);
    if (result == false && req.file && req.file.filename) {
      const filePath = path.join(process.cwd(), QUESTION_IMAGE_AND_AUDIO_DESTINATION, req.file.filename);
      fs.unlinkSync(filePath);
    }
    return res.status(200).json(result);
  } catch (err) {
    if (req.file && req.file.filename) {
      const filePath = path.join(process.cwd(), QUESTION_IMAGE_AND_AUDIO_DESTINATION, req.file.filename);
      fs.unlinkSync(filePath);
    }
    console.log(err);
    next(err);
  }
});

router.post("/send-modified-question-image", upload.single("image"), async (req: any, res: any, next: any) => {
  try {
    // console.log("TEACHER SEND MODIFIED IMAGE ROUTE!");
    // console.log(req.body);
    // console.log(req.file);
    const result = await TeacherService.saveModifiedQuestionImage(req.body.questionId, req.file);
    // console.log(result);
    if (result == false && req.file && req.file.filename) {
      const filePath = path.join(process.cwd(), QUESTION_IMAGE_AND_AUDIO_DESTINATION, req.file.filename);
      fs.unlinkSync(filePath);
    }
    return res.status(200).json(true);
  } catch (err) {
    if (req.file && req.file.filename) {
      const filePath = path.join(process.cwd(), QUESTION_IMAGE_AND_AUDIO_DESTINATION, req.file.filename);
      fs.unlinkSync(filePath);
    }
    console.log(err);
    next(err);
  }
});

router.post("/send-question-audio", upload.single("audio"), async (req: any, res: any, next: any) => {
  try {
    // console.log("TEACHER SEND AUDIO ROUTE!");
    // console.log(req.body);
    // console.log(req.file);
    const result = await TeacherService.saveQuestionAudio(req.body.temporaryKey, req.file);
    // console.log(result);
    if (result == false && req.file && req.file.filename) {
      const filePath = path.join(process.cwd(), QUESTION_IMAGE_AND_AUDIO_DESTINATION, req.file.filename);
      fs.unlinkSync(filePath);
    }
    return res.status(200).json(result);
  } catch (err) {
    if (req.file && req.file.filename) {
      const filePath = path.join(process.cwd(), QUESTION_IMAGE_AND_AUDIO_DESTINATION, req.file.filename);
      fs.unlinkSync(filePath);
    }
    console.log(err);
    next(err);
  }
});

router.post("/send-modified-question-audio", upload.single("audio"), async (req: any, res: any, next: any) => {
  try {
    // console.log("TEACHER SEND AUDIO ROUTE!");
    // console.log(req.body);
    // console.log(req.file);
    const result = await TeacherService.saveModifiedQuestionAudio(req.body.questionId, req.file);
    // console.log(result);
    if (result == false && req.file && req.file.filename) {
      const filePath = path.join(process.cwd(), QUESTION_IMAGE_AND_AUDIO_DESTINATION, req.file.filename);
      fs.unlinkSync(filePath);
    }
    return res.status(200).json(result);
  } catch (err) {
    if (req.file && req.file.filename) {
      const filePath = path.join(process.cwd(), QUESTION_IMAGE_AND_AUDIO_DESTINATION, req.file.filename);
      fs.unlinkSync(filePath);
    }
    console.log(err);
    next(err);
  }
});

router.post("/delete-question-temporary-key", async (req: any, res: any, next: any) => {
  try {
    // console.log("TEACHER DELETE QUESTION TEMPORATY KEY ROUTE!");
    // console.log(req.body);
    const result = await TeacherService.deleteQuestionTemporaryKey(req.body.exerciseId);
    // console.log(result);
    return res.status(200).json(result);
  } catch (err) {
    console.log(err);
    next(err);
  }
});
  
export { router as TeacherExerciseRouter };