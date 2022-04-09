import * as jwt from "jsonwebtoken";
import { UserRole } from "../utils/constants/role.constant";

export function extractUser(req: any, res: any, next: any) {
  const token =
    req.body.token || req.query.token || req.headers["x-access-token"];

  if (!token) {
    req.user = {
      accountId: undefined,
      username: undefined,
      role: UserRole.GUEST,
    };
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.TOKEN_KEY || "");
    req.user = decoded;
    return next();
  } catch (err) {
    req.user = {
      accountId: undefined,
      username: undefined,
      role: UserRole.GUEST,
    };
    return next();
  }
}
