import * as express from "express";
import { guard } from "../../middlewares/guard";
import { UserRole } from "../../utils/constants/role.constant";
import { SigninRouter } from "./signin";
import { SignupRouter } from "./signup";

const router = express.Router();

router.use(guard([UserRole.GUEST]), SigninRouter);
router.use(
  guard([UserRole.GUEST, UserRole.ADMIN, UserRole.EMPLOYEE]),
  SignupRouter
);

export default router;
