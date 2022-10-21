import { UserStudent } from "../../entities/UserStudent";

export default interface UserStudentRepository { 
    findStudentById: (studentId: number) => Promise<UserStudent | null>;
}