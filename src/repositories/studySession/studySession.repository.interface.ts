import { StudySession } from "../../entities/StudySession";
import { UserAttendStudySession } from "../../entities/UserAttendStudySession";
import Pageable from "../helpers/pageable";

export default interface StudySessionRepository{
    findStudySessionByStudent: (studentId: number, courseId: string) => Promise<UserAttendStudySession[] | null>;

    findStudySessionsByCourseSlug: (courseSlug: string, pageable: Pageable) => Promise<StudySession[]>;

    countStudySessionsByCourseSlug: (courseSlug: string) => Promise<number>;
}