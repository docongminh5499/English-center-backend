import { UserRole } from "../../utils/constants/role.constant";

export default class UserContactDto {
    userAvatar: string | null;
    userFullName: string;
    userRole: UserRole;
    userId: number;
    isActive: boolean;
}