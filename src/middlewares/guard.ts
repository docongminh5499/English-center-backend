
import { UserRole } from "../utils/constants/role.constant";
import { UnauthorizedError } from "../utils/errors/unauthorized.error";

export function guard(allowUsers: UserRole[]) {
  return (req: any, res: any, next: any) => {
    if (allowUsers.includes(req.user.role)) next();
    else next(new UnauthorizedError());
  };
}
