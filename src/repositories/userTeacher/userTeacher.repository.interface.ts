import { UserTeacher } from "../../entities/UserTeacher";

export default interface UserTeacherRepository {
    findUserTeacherByid: (userId: number) => Promise<UserTeacher | null>;

    findUserTeacherByBranchAndPreferedCurriculum: (branchId: number, curriculum: number) => Promise<UserTeacher[]>;

    findPreferedCurriculums: (teacherId: number) => Promise<UserTeacher | null>;
}