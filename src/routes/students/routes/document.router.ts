import * as express from "express";
import { StudentService } from "../../../services/student";

const router = express.Router();

router.get("/get-all-document", async (req: any, res: any, next: any) => {
    try{
        const docuents = await StudentService.getDocument(req.query.courseId);
        console.log(docuents);
        return res.status(200).json(docuents);
    }catch(err){
        console.log(err);
        next(err);
    }
});

export { router as DocumentRouter };