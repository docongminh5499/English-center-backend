import * as express from "express";
import { guard } from "../../middlewares/guard";
import { UserRole } from "../../utils/constants/role.constant";
import { SigninRouter } from "./routers/signin.router";
import { SignupRouter } from "./routers/signup.router";
import { VerifyRouter } from "./routers/verify.router";
import { MessageRouter } from "./routers/message.router";
import { NotificationRouter } from "./routers/notification.router";
import { ModifyAccountRouter } from "./routers/modifyAccount.router";

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

router.use("/message", guard([
  UserRole.ADMIN,
  UserRole.EMPLOYEE,
  UserRole.PARENT,
  UserRole.STUDENT,
  UserRole.TEACHER,
  UserRole.TUTOR,
]), MessageRouter);

router.use("/notification", guard([
  UserRole.ADMIN,
  UserRole.EMPLOYEE,
  UserRole.PARENT,
  UserRole.STUDENT,
  UserRole.TEACHER,
  UserRole.TUTOR,
]), NotificationRouter);

router.use("/modify-account", guard([
  UserRole.ADMIN,
  UserRole.EMPLOYEE,
  UserRole.PARENT,
  UserRole.STUDENT,
  UserRole.TEACHER,
  UserRole.TUTOR,
]), ModifyAccountRouter);

export default router;
