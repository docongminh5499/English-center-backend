import { StudySession } from "../../entities/StudySession";
import { UserAttendStudySession } from "../../entities/UserAttendStudySession";
import Pageable from "../helpers/pageable";

export default interface StudySessionRepository {
    findStudySessionByStudent: (studentId: number, courseId: string) => Promise<UserAttendStudySession[] | null>;

    findStudySessionsByCourseSlugAndTeacher: (courseSlug: string, pageable: Pageable, teacherId?: number | undefined, query?: string) => Promise<StudySession[]>;

    countStudySessionsByCourseSlugAndTeacher: (courseSlug: string, teacherId?: number | undefined, query?: string) => Promise<number>;

    findStudySessionById: (studySessionId: number) => Promise<StudySession | null>;

    findCourseIdsByTeacherId: (teacherId: number) => Promise<{ id: number }[]>;

    findStudySessionsByTeacherId: (teacherId: number, startDate: Date, endDate: Date, pageable: Pageable) => Promise<StudySession[]>;

    countStudySessionsByTeacherId: (teacherId: number, startDate: Date, endDate: Date) => Promise<number>;

    findStudySessionsByTutorId: (tutorId: number, startDate: Date, endDate: Date, pageable: Pageable) => Promise<StudySession[]>;

    countStudySessionsByTutorId: (tutorId: number, startDate: Date, endDate: Date) => Promise<number>;

    findCourseIdsByTutorId: (tutorId: number) => Promise<{ id: number }[]>;

    findStudySessionsByCourseSlugAndTutor: (courseSlug: string, pageable: Pageable, tutorId: number) => Promise<StudySession[]>;

    countStudySessionsByCourseSlugAndTutor: (courseSlug: string, tutorId: number) => Promise<number>;
}