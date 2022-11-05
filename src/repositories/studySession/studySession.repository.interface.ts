import { StudySession } from "../../entities/StudySession";
import { UserAttendStudySession } from "../../entities/UserAttendStudySession";
import Pageable from "../helpers/pageable";

export default interface StudySessionRepository {
    findStudySessionByStudent: (studentId: number, courseId: string) => Promise<UserAttendStudySession[] | null>;

    findStudySessionsByCourseSlug: (courseSlug: string, pageable: Pageable, teacherId?: number | undefined) => Promise<StudySession[]>;

    countStudySessionsByCourseSlug: (courseSlug: string, teacherId?: number | undefined) => Promise<number>;

    findStudySessionById: (studySessionId: number) => Promise<StudySession | null>;

    findCourseIdsByTeacherId: (teacherId: number) => Promise<{ id: number }[]>;

    findStudySessionsByTeacherId: (teacherId: number, startDate: Date, endDate: Date, pageable: Pageable) => Promise<StudySession[]>;

    countStudySessionsByTeacherId: (teacherId: number, startDate: Date, endDate: Date) => Promise<number>;
}