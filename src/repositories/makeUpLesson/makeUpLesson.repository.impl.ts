import { MakeUpLession } from "../../entities/MakeUpLession";
import MakeUpLessionRepositoryInterface from "./makeUpLesson.repository.interface";


class MakeUpLessionRepositoryImpl implements MakeUpLessionRepositoryInterface {
  async findByStudentAndCourse(studentId: number, courseSlug: string): Promise<MakeUpLession[]> {
    return await MakeUpLession.createQueryBuilder("mul")
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
      .getMany();
  }
}
const MakeUpLessionRepository = new MakeUpLessionRepositoryImpl();
export default MakeUpLessionRepository;