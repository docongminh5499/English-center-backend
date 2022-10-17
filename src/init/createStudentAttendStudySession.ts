import { faker } from "@faker-js/faker";
import { StudentParticipateCourse } from "../entities/StudentParticipateCourse";
import { StudySession } from "../entities/StudySession";
import { UserAttendStudySession } from "../entities/UserAttendStudySession";


export async function createStudentAttendStudySession(participations: StudentParticipateCourse[], studySessions: StudySession[]) {
  const attendances = [];
  for (const participation of participations) {
    for (const studySession of studySessions) {
      if (studySession.date > new Date()) continue;

      let attendanceStatus = faker.helpers.arrayElement([true, true, true, true, false]);

      let commentOfTeacher = 'Học viên tham gia học tốt.';
      if (attendanceStatus === false)
        commentOfTeacher = "Học viên vắng buổi học.";
      let userAttendStudySession = new UserAttendStudySession();
      userAttendStudySession.student = participation.student;
      userAttendStudySession.studySession = studySession;
      userAttendStudySession.commentOfTeacher = commentOfTeacher;
      userAttendStudySession.isAttend = attendanceStatus;

      userAttendStudySession = await UserAttendStudySession.save(userAttendStudySession);
      attendances.push(userAttendStudySession);
    }
  }
  console.log(`Create ${attendances.length} student attend study session`);
  return attendances;
}