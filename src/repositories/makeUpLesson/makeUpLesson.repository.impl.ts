import { MakeUpLession } from "../../entities/MakeUpLession";
import MakeUpLessionRepositoryInterface from "./makeUpLesson.repository.interface";


class MakeUpLessionRepositoryImpl implements MakeUpLessionRepositoryInterface {
  async findByStudentAndCourse(studentId: number, courseSlug: string, teacherId: number | undefined): Promise<MakeUpLession[]> {
    let query = MakeUpLession.createQueryBuilder("mul")
      .setLock("pessimistic_read")
      .useTransaction(true)
      .leftJoinAndSelect("mul.student", "student")
      .leftJoinAndSelect("student.user", "userStudent")
      .leftJoinAndSelect("mul.studySession", "studySession")
      .leftJoinAndSelect("studySession.course", "courseStudySession")
      .leftJoinAndSelect("mul.targetStudySession", "targetStudySession")
      .leftJoinAndSelect("targetStudySession.course", "courseTargetStudySession")
      .where("userStudent.id = :studentId", { studentId })
      .andWhere("courseStudySession.slug = :courseSlug", { courseSlug })
    if (teacherId !== undefined)
      query = query.andWhere("studySession.teacherWorker = :teacherId", { teacherId })
    return await query.getMany();
  }


  async findByStudySessionId(studySessionId: number): Promise<MakeUpLession[]> {
    return await MakeUpLession.createQueryBuilder("mul")
      .setLock("pessimistic_read")
      .useTransaction(true)
      .leftJoinAndSelect("mul.student", "student")
      .leftJoinAndSelect("student.user", "userStudent")
      .leftJoinAndSelect("mul.studySession", "studySession")
      .leftJoinAndSelect("mul.targetStudySession", "targetStudySession")
      .leftJoinAndSelect("targetStudySession.teacher", "teacher")
      .leftJoinAndSelect("teacher.worker", "teacherWorker")
      .leftJoinAndSelect("teacherWorker.user", "teacherUser")
      .leftJoinAndSelect("targetStudySession.shifts", "shifts")
      .leftJoinAndSelect("targetStudySession.course", "courseTargetStudySession")
      .where("studySession.id = :studySessionId", { studySessionId })
      .orderBy({
        "shifts.weekDay": "ASC",
        "shifts.startTime": "ASC",
      })
      .getMany();
  }


  async findByTargetStudySessionId(studySessionId: number): Promise<MakeUpLession[]> {
    return await MakeUpLession.createQueryBuilder("mul")
      .setLock("pessimistic_read")
      .useTransaction(true)
      .leftJoinAndSelect("mul.student", "student")
      .leftJoinAndSelect("student.user", "userStudent")
      .leftJoinAndSelect("mul.studySession", "studySession")
      .leftJoinAndSelect("mul.targetStudySession", "targetStudySession")
      .where("targetStudySession.id = :studySessionId", { studySessionId })
      .getMany();
  }
}
const MakeUpLessionRepository = new MakeUpLessionRepositoryImpl();
export default MakeUpLessionRepository;