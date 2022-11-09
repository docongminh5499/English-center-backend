import * as express from "express";
import { ParentService } from "../../../services/parent";

const router = express.Router();

router.get("/get-personal-infomation", async (req: any, res: any, next: any) => {
    try{
        console.log("AAA")
        const userParent = await ParentService.getUserParent(req.user.userId);
        return res.status(200).json(userParent);
    }catch(err){
        console.log(err);
        next(err);
    }
});

export { router as ParentRouter };