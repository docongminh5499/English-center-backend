import { UserAttendStudySession } from "../../entities/UserAttendStudySession";

export default interface UserAttendStudySessionRepository { 
    findAttendenceByStudentAndCourse: (studentId: number, courseSlug: string, teacherId: number|undefined) => Promise<UserAttendStudySession[]>;

    findAttendenceByStudySessionId: (studySessionId: number) => Promise<UserAttendStudySession[]>;
}