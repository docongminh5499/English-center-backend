import { UserAttendStudySession } from "../../entities/UserAttendStudySession";
import ShiftRepository from "../shift/shift.repository.impl";
import UserAttendStudySessionRepositoryInterface from "./userAttendStudySession.repository.interface";


class UserAttendStudySessionRepositoryImpl implements UserAttendStudySessionRepositoryInterface {
  async findAttendenceByStudentAndCourse(studentId: number, courseSlug: string, teacherId: number | undefined): Promise<UserAttendStudySession[]> {
    let query = UserAttendStudySession.createQueryBuilder('a')
      .setLock("pessimistic_read")
      .useTransaction(true)
      .leftJoinAndSelect("a.student", "student")
      .leftJoinAndSelect("student.user", "userStudent")
      .leftJoinAndSelect("a.studySession", "studySession")
      .leftJoinAndSelect("studySession.course", "course")
      .where("userStudent.id = :studentId", { studentId })
      .andWhere("course.slug = :courseSlug", { courseSlug });
    if (teacherId !== undefined)
      query = query.andWhere("studySession.teacherWorker = :teacherId", { teacherId })
    const result = await query.getMany();
    for (let index = 0; index < result.length; index++) {
      const attendence = result[index];
      attendence.studySession.shifts = await
        ShiftRepository.findShiftsByStudySession(attendence.studySession.id);
    }
    return result;
  }


  async findAttendenceByStudySessionId(studySessionId: number): Promise<UserAttendStudySession[]> {
    return await UserAttendStudySession.createQueryBuilder('a')
      .setLock("pessimistic_read")
      .useTransaction(true)
      .leftJoinAndSelect("a.student", "student")
      .leftJoinAndSelect("student.user", "userStudent")
      .leftJoinAndSelect("a.studySession", "studySession")
      .where("studySession.id = :studySessionId", { studySessionId })
      .getMany();
  }
}

const UserAttendStudySessionRepository = new UserAttendStudySessionRepositoryImpl();
export default UserAttendStudySessionRepository;