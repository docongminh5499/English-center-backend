import * as express from "express";
import { ParentService } from "../../../services/parent";

const router = express.Router();

router.get("/get-all-student-courses", async (req: any, res: any, next: any) => {
    try{
        const courses = await ParentService.getCoursesForTimetableByParent(req.query.studentId);
        // console.log(courses);
        return res.status(200).json(courses);
    }catch(err){
        console.log(err);
        next(err);
    }
});

export { router as TimetableRouter };