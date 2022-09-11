import * as express from "express";
import { guard } from "../../middlewares/guard";
import { UserRole } from "../../utils/constants/role.constant";
import { SigninRouter } from "./routers/signin.router";
import { SignupRouter } from "./routers/signup.router";

const router = express.Router();

router.use(guard([UserRole.GUEST]), SigninRouter);
router.use(
  guard([UserRole.GUEST, UserRole.ADMIN, UserRole.EMPLOYEE]),
  SignupRouter
);

export default router;
