import * as express from "express";
import { guard } from "../../middlewares/guard";
import { UserRole } from "../../utils/constants/role.constant";
import { SigninRouter } from "./routers/signin.router";
import { SignupRouter } from "./routers/signup.router";
import { VerifyRouter } from "./routers/verify.router";

const router = express.Router();

router.use("/sign-in", guard([UserRole.GUEST]), SigninRouter);

router.use("/sign-up", guard([
  UserRole.GUEST, 
  UserRole.ADMIN, 
  UserRole.EMPLOYEE
]), SignupRouter);

router.use("/verify", guard([
  UserRole.ADMIN,
  UserRole.EMPLOYEE,
  UserRole.GUEST,
  UserRole.PARENT,
  UserRole.STUDENT,
  UserRole.TEACHER,
  UserRole.TUTOR,
]), VerifyRouter);

export default router;
