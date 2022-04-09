import { AccountRole } from "../utils/constants/role.constant";

export type AccountType = {
  username: string;
  password: string;
  role: AccountRole;
};
