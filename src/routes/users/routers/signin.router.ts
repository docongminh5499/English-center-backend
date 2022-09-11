import * as express from "express";
import { AccountMapper } from "../mappers";
import { UserService } from "../../../services/user";

const router = express.Router();

router.post(
  "/sign-in",
  async (req: any, res: any, next: any) => {
    try {
      const accountDto = AccountMapper.mapToDto(req.body);
      const credentialDto = await UserService.signin(accountDto);
      return res.status(200).json(credentialDto);
    } catch (err) {
      console.log(err);
      next(err);
    }
  }
);

export { router as SigninRouter };
