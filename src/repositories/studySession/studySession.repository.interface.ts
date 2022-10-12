import { UserAttendStudySession } from "../../entities/UserAttendStudySession";

export default interface StudySessionRepository{
    findStudySessionByStudent: (studentId: number, courseId: string) => Promise<UserAttendStudySession[] | null>;
}