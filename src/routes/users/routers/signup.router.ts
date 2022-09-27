import * as express from "express";
// import * as bcrypt from "bcryptjs";
import { Account } from "../../../entities/Account";
import { User } from "../../../entities/UserEntity";
import * as bcrypt from "bcryptjs";
import { UserService } from "../../../services/user";

const router = express.Router();

router.post("/", async (req: any, res: any, next: any) => {
  const user = User.create({...req.body.userInfo});
  
  const accountInfo = req.body.accountInfo;
  const account = new Account();
  account.username = accountInfo.username;
  account.password = await bcrypt.hash(accountInfo.password, 10);
  account.role = accountInfo.role;
  account.user = user;

  console.log(user);
  console.log("=============================================");
  console.log(account);
  
  try{
    await UserService.signup(user, account);
    return res.status(200).json({ message: "Create account succesful" });
  }catch(err){
    console.log(err);
    next(err)
  }
});

router.get("/check-old-email", async (req: any, res: any, next: any) => {
  const email = req.query.email;
  const isOldEmail = await UserService.checkOldEmail(email);
  return res.status(200).json({ isOldEmail: isOldEmail });
});

export { router as SignupRouter };
