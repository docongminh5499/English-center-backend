import { UserTeacher } from "../../entities/UserTeacher";

export default interface UserTeacherRepository {
    findUserTeacherByid: (userId: number) => Promise<UserTeacher | null>;
}