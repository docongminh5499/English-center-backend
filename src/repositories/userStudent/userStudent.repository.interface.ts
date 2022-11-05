import { UserStudent } from "../../entities/UserStudent";

export default interface UserStudentRepository { 
    findStudentById: (studentId: number) => Promise<UserStudent | null>;
    findUserStudentById: (userId: number) => Promise<UserStudent | null>;
}