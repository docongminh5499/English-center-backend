import { UserAttendStudySession } from "../../entities/UserAttendStudySession";
import ShiftRepository from "../shift/shift.repository.impl";
import UserAttendStudySessionRepositoryInterface from "./userAttendStudySession.repository.interface";


class UserAttendStudySessionRepositoryImpl implements UserAttendStudySessionRepositoryInterface {
  async findAttendenceByStudentAndCourse(studentId: number, courseSlug: string): Promise<UserAttendStudySession[]> {
    const result = await UserAttendStudySession.createQueryBuilder('a')
      .leftJoinAndSelect("a.student", "student")
      .leftJoinAndSelect("student.user", "userStudent")
      .leftJoinAndSelect("a.studySession", "studySession")
      .leftJoinAndSelect("studySession.course", "course")
      .where("userStudent.id = :studentId", { studentId })
      .andWhere("course.slug = :courseSlug", { courseSlug })
      .getMany();
    for (let index = 0; index < result.length; index++) {
      const attendence = result[index];
      attendence.studySession.shifts = await
        ShiftRepository.findShiftsByStudySession(attendence.studySession.id);
    }
    return result;
  }
}

const UserAttendStudySessionRepository = new UserAttendStudySessionRepositoryImpl();
export default UserAttendStudySessionRepository;