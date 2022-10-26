import { MakeUpLession } from "../../entities/MakeUpLession";

export default interface MakeUpLessionRepository {
    findByStudentAndCourse: (studentId: number, courseSlug: string, teacherId: number | undefined) => Promise<MakeUpLession[]>;

    findByStudySessionId: (studySessionId: number) => Promise<MakeUpLession[]>;

    findByTargetStudySessionId: (studySessionId: number) => Promise<MakeUpLession[]>;
}