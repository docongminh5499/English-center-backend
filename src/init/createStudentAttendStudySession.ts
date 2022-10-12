import { StudentParticipateCourse } from "../entities/StudentParticipateCourse";
import { StudySession } from "../entities/StudySession";
import { UserAttendStudySession } from "../entities/UserAttendStudySession";
import { UserStudent } from "../entities/UserStudent";
import { AttendanceStatus } from "../utils/constants/attendance.constant";
import { StudySessionState } from "../utils/constants/studySession.constant";

export async function createStudentAttendStudySession(studentParticipateCourse: StudentParticipateCourse){
    const studySessions = await StudySession.createQueryBuilder()
                                            .where("courseId = :courseId", {courseId: studentParticipateCourse.course})
                                            .getMany();

    for(const studySession of studySessions){
        if (studySession.state === StudySessionState.Finish){
            let commentOfTeacher = 'Học viên tham gia học tốt.'
            let attendanceStatus = AttendanceStatus.Attendance;

            const random = Math.random()* 101;
            if(random < 5){
                commentOfTeacher = "Học viên vắng buổi học.";
                attendanceStatus = AttendanceStatus.AbsenceWithPermission;
            }else if(random < 8){
                commentOfTeacher = "Học viên vắng buổi học không phép.";
                attendanceStatus = AttendanceStatus.AbsenceWithoutPermission;
            }

            const userAttendStudySession = new UserAttendStudySession();
            userAttendStudySession.student = (await UserStudent.createQueryBuilder().where("studentId = :studentId", {studentId: studentParticipateCourse.student}).getOne())!;
            userAttendStudySession.studySession = studySession;
            userAttendStudySession.commentOfTeacher = commentOfTeacher;
            userAttendStudySession.isAttend = attendanceStatus;

            await UserAttendStudySession.save(userAttendStudySession);
        }
    }
}