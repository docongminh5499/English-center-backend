import * as express from "express";
import { StudentService } from "../../../services/student";

const router = express.Router();

router.get("/", async (req: any, res: any, next: any) => {
    try{
        const courses = await StudentService.getCoursesByUsername(req.query.username);
        return res.status(200).json(courses);
    }catch(err){
        console.log(err);
        next(err);
    }
});

export { router as TimetableRouter };