import { UserRole } from "../utils/constants/role.constant";
export declare function guard(allowUsers: UserRole[]): (req: any, res: any, next: any) => void;
