import { UserTeacher } from "../../entities/UserTeacher";
import Pageable from "../helpers/pageable";

export default interface UserTeacherRepository {
    findUserTeacherByid: (userId: number) => Promise<UserTeacher | null>;

    findUserTeacherByBranchAndPreferedCurriculum: (branchId: number, curriculum: number) => Promise<UserTeacher[]>;

    findPreferedCurriculums: (teacherId: number) => Promise<UserTeacher | null>;

    findTeachersAvailableInDate: (date: Date, shiftIds: number[], studySession: number, curriculumId: number, branchId?: number) => Promise<UserTeacher[]>;

    getTeacherByPreferedCurriculum: (curriculumId: number, branchId: number, pageable: Pageable, query?: string) => Promise<UserTeacher[]>;

    countTeacherByPreferedCurriculum: (curriculumId: number, branchId: number, query?: string) => Promise<number>;

    getTeacherByNotPreferedCurriculumAndBranch: (branchId: number, pageable: Pageable, query?: string) => Promise<UserTeacher[]>;

    countTeacherByNotPreferedCurriculumAndBranch: (branchId: number, query?: string) => Promise<number>;
}