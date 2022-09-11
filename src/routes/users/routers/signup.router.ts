import * as express from "express";
// import * as bcrypt from "bcryptjs";
import { Account } from "../../../entities/Account";
// import { DuplicateError } from "../../../utils/errors/duplicate.error";
import { ValidateRequest } from "../../../middlewares/validateRequest";

const router = express.Router();

router.post("/", ValidateRequest(Account), async (req: any, res: any, next: any) => {
  // try {
  //   const { username, password, role } = req.body as AccountType;
  //   // Check if account exists or not
  //   const oldUser = await Account.findOne({
  //     where: { username },
  //   });
  //   if (oldUser) return next(new DuplicateError());
  //   // Create new account
  //   const encryptedPassword = await bcrypt.hash(password, 10);
  //   await Account.save({
  //     username: username,
  //     password: encryptedPassword,
  //     role: role,
  //   });
  //   // Return result
  //   return res.status(200).json({ message: "Create account succesful" });
  // } catch (err) {
  //   console.log(err);
  //   next(err);
  // }
  return "Not Implemented Yet";
}
);

export { router as SignupRouter };
