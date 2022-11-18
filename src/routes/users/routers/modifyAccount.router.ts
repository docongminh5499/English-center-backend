import * as express from "express";
import { AccountDto } from "../../../dto";
import { UserService } from "../../../services/user";

const router = express.Router();

router.post("/", async (req: any, res: any, next: any) => {
  try {
    const oldAccountDto = new AccountDto();
    oldAccountDto.username = req.body.oldUsername;
    oldAccountDto.password = req.body.oldPassword;
    const newAccountDto = new AccountDto();
    newAccountDto.username = req.body.username;
    newAccountDto.password = req.body.newPassword;
    const credentialDto = await UserService.modifyAccount(oldAccountDto, newAccountDto);
    return res.status(200).json(credentialDto);
  } catch (err) {
    console.log(err);
    next(err);
  }
}
);

export { router as ModifyAccountRouter };
