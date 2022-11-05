import { UserStudent } from "../../entities/UserStudent";

export default interface UserTeacherRepository {
    findUserStudentById: (userId: number) => Promise<UserStudent | null>;
}