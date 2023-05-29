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

router.post("/create-curriculum-exercise", async (req: any, res: any, next: any) => {
    try {
      // console.log(req.body);
      // console.log(req.files);
      const exercise = await TeacherService.createCurriculumExercise(req.user.userId, req.body.curriculumId, req.body.lectureId, req.body.basicInfo, req.body.questions);
      // console.log(exercise);
      return res.status(200).json(exercise);
    } catch (err) {
      console.log(err);
      next(err);
    }
});


router.post("/modify-curriculum-exercise", async (req: any, res: any, next: any) => {
  try {
    // console.log("=========================================");
    // console.log(req.body.basicInfo);
    const exercise = await TeacherService.modifyCurruculumExercise(req.user.userId, req.body.exerciseId, req.body.basicInfo, req.body.questions,  req.body.deleteQuestions);
    return res.status(200).json(exercise);
  } catch (err) {
    console.log(err);
    next(err);
  }
});

router.post("/change-curriculum-exercise-info", async (req: any, res: any, next: any) => {
  try {
    // console.log("=========================================");
    // console.log(req.body.basicInfo);
    const exercise = await TeacherService.changeCurriculumExerciseInfo(req.user.userId, req.body.exerciseId, req.body.basicInfo);
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

router.get("/get-curriculum-exercise-by-id", async (req: any, res: any, next: any) => {
  try {
    const curriculumExercise = await TeacherService.getCurriculumExerciseById(req.user.userId, req.query.exerciseId);
    return res.status(200).json(curriculumExercise);
  } catch (err) {
    console.log(err);
    next(err);
  }
});

router.post("/send-question-store-image", upload.single("image"), async (req: any, res: any, next: any) => {
  try {
    const result = await TeacherService.saveQuestionImageForCurriculumExercise(req.user.userId, req.body.temporaryKey, req.file);
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

router.post("/send-modified-question-store-image", upload.single("image"), async (req: any, res: any, next: any) => {
  try {
    // console.log("TEACHER SEND MODIFIED IMAGE ROUTE!");
    // console.log(req.body);
    // console.log(req.file);
    const result = await TeacherService.saveModifiedQuestionStoreImage(req.user.userId, req.body.questionId, req.file);
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

router.post("/send-question-store-audio", upload.single("audio"), async (req: any, res: any, next: any) => {
  try {
    const result = await TeacherService.saveQuesitonAudioForCurriculumExercise(req.user.userId, req.body.temporaryKey, req.file);
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

router.post("/send-modified-question-store-audio", upload.single("audio"), async (req: any, res: any, next: any) => {
  try {
    // console.log("TEACHER SEND AUDIO ROUTE!");
    // console.log(req.body);
    // console.log(req.file);
    const result = await TeacherService.saveModifiedQuestionStoreAudio(req.user.userId, req.body.questionId, req.file);
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

router.post("/delete-question-store-temporary-key", async (req: any, res: any, next: any) => {
  try {
    // console.log("TEACHER DELETE QUESTION TEMPORATY KEY ROUTE!");
    // console.log(req.body);
    const result = await TeacherService.deleteQuestionStoreTemporaryKey(req.user.userId, req.body.exerciseId);
    // console.log(result);
    return res.status(200).json(result);
  } catch (err) {
    console.log(err);
    next(err);
  }
});

router.post("/delete-curriculum-exercise", async (req: any, res: any, next: any) => {
  try {
    // console.log("TEACHER DELETE QUESTION TEMPORATY KEY ROUTE!");
    // console.log(req.body);
    const result = await TeacherService.deleteCurriculumExercise(req.user.userId, req.body.exerciseId);
    console.log(result);
    return res.status(200).json(result);
  } catch (err) {
    console.log(err);
    next(err);
  }
});
  
export { router as TeacherCurriculumExerciseRouter };