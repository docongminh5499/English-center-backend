import * as express from "express";
import { CredentialMapper } from "../mappers";
import { UserService } from "../../../services/user";

const router = express.Router();


router.post("/", async (req: any, res: any, next: any) => {
    try {
        const credential = CredentialMapper.mapToDto(req);
        const decode = await UserService.decode(credential);
        return res.status(200).json(decode);
    } catch (err) {
        console.log(err);
        next(err);
    }
}
);

export { router as VerifyRouter };