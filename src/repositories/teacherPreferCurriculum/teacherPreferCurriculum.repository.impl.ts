import { DeleteResult } from "typeorm";
import { TeacherPreferCurriculum } from "../../entities/TeacherPreferCurriculum";
import TeacherPreferCurriculumRepositoryInterface from "./teacherPreferCurriculum.repository.interface";

class TeacherPreferCurriculumRepositoryImpl implements TeacherPreferCurriculumRepositoryInterface {
  async deletePreferCurriculum(teacherId: number, curriculumId: number): Promise<boolean> {
    const result: DeleteResult = await TeacherPreferCurriculum
      .createQueryBuilder()
      .setLock("pessimistic_write")
      .useTransaction(true)
      .delete()
      .where("teacherId = :teacherId", { teacherId })
      .andWhere("curriculumId = :curriculumId", { curriculumId })
      .execute();
    return result.affected !== undefined
      && result.affected !== null
      && result.affected > 0;
  }
}


const TeacherPreferCurriculumRepository = new TeacherPreferCurriculumRepositoryImpl();
export default TeacherPreferCurriculumRepository;