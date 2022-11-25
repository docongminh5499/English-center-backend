import { UserStudent } from "../../entities/UserStudent";
import Pageable from "../helpers/pageable";

export default interface UserStudentRepository { 
    findStudentById: (studentId: number) => Promise<UserStudent | null>;

    findUserStudentById: (userId: number) => Promise<UserStudent | null>;

    findStudents: (pageable: Pageable, query?: string) => Promise<UserStudent[]>;
    
    countStudents: (query?: string) => Promise<number>;
    
    getLateFeeStudent: (branchId: number, pageable: Pageable) => Promise<UserStudent[]>;

    countLateFeeStudent: (branchId: number) => Promise<number>;
}