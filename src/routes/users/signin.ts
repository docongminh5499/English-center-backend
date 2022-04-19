import * as express from "express";
import * as bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";
import { Account } from "../../entities/Account";
import { ValidationError } from "../../utils/errors/validation.error";
import { NotFoundError } from "../../utils/errors/notFound.error";

const router = express.Router();

router.post(
  "/sign-in",
  async (req: any, res: any, next: any) => {
    try {
      const username: string | undefined = req.body.username;
      const password: string | undefined = req.body.password;

      if (!(username && password)) {
        return next(new ValidationError([]));
      }

      const account = await Account.findOne({ where: { username }, relations: ['user'] });
      if (account && (await bcrypt.compare(password, account.password))) {
        const token = jwt.sign(
          {
            userId: account.user.id,
            username: account.username,
            role: account.role,
          },
          process.env.TOKEN_KEY || "",
          {
            expiresIn: "1d",
          }
        );
        
        const decodeJWT = jwt.decode(token) as any;
        return res.status(200).json({
          username: account.username,
          role: account.role,
          token: token,
          expireTime: decodeJWT?.exp,
        });
      }
      return next(new NotFoundError());
    } catch (err) {
      console.log(err);
      next(err);
    }
  }
);

export { router as SigninRouter };
