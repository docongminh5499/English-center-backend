import * as express from "express";
import { StudentService } from "../../../services/student";

const router = express.Router();

router.get("/", async (req: any, res: any, next: any) => {
    try{
        const courses = await StudentService.getCoursesForTimetableByStudent(req.user.userId);
        return res.status(200).json(courses);
    }catch(err){
        console.log(err);
        next(err);
    }
});

router.get("/get-makeup-lession-compatible", async (req: any, res: any, next: any) => {
    try {
        console.log("STUDENT GET MAKEUP LESSION CAMPATIBLE ROUTE");
        const courseId = req.query.courseId;
        const curriculumId = req.query.curriculumId;
        const branchId = req.query.branchId;
        const order = req.query.order;
        // console.log(req.query);
        const result = await StudentService.getMakeupLessionCompatible(curriculumId, branchId, order, courseId);
        // console.log(result);
        return res.status(200).json(result);
    } catch (err) {
        console.log(err);
        next(err);
    }
});
  
router.post("/register-makeup-lession", async (req: any, res: any, next: any) => {
    try {
        console.log("STUDENT REGISTER MAKEUP LESSION CAMPATIBLE ROUTE");
        const studySession = req.body.studySession;
        const targetStudySession = req.body.targetStudySession;
        // console.log(req.body);
        const result = await StudentService.registerMakeupLession(req.user.userId, studySession, targetStudySession);
        // console.log("----------------------------------------------------");
        // console.log(result);
        return res.status(200).json(result);
    } catch (err) {
        console.log(err);
        next(err);
    }
});

router.get("/get-makeup-lession", async (req: any, res: any, next: any) => {
    try {
        console.log("STUDENT GET MAKEUP LESSION ROUTE");
        // console.log(req.body);
        const result = await StudentService.getMakeupLession(req.user.userId);
        // console.log("----------------------------------------------------");
        // console.log(result);
        return res.status(200).json(result);
    } catch (err) {
        console.log(err);
        next(err);
    }
});

router.post("/delete-makeup-lession", async (req: any, res: any, next: any) => {
    try {
        console.log("STUDENT DELETE MAKEUP LESSION ROUTE");
        console.log(req.body);
        const result = await StudentService.deleteMakeupLession(req.user.userId, req.body.studySessionId, req.body.targetStudySessionId);
        console.log("----------------------------------------------------");
        console.log(result);
        return res.status(200).json(result);
    } catch (err) {
        console.log(err);
        next(err);
    }
});

export { router as TimetableRouter };