import { User } from "./UserEntity";
import { Fee } from "./Fee";
import { Exercise } from "./Exercise";
import { Question } from "./Question";
import { Notification } from "./Notification";
import { UserRole } from "../utils/constants/role.constant";
export declare class UserStudent extends User {
    id: number;
    roles: UserRole.STUDENT;
    fee: Fee;
    exercise: Exercise;
    question: Question;
    notification: Notification;
}
