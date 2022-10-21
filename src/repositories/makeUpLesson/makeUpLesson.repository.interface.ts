import { MakeUpLession } from "../../entities/MakeUpLession";

export default interface MakeUpLessionRepository {
    findByStudentAndCourse: (studentId: number, courseSlug: string) => Promise<MakeUpLession[]>;
}