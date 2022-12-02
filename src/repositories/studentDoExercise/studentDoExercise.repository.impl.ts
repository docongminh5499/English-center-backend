import { StudentDoExercise } from "../../entities/StudentDoExercise";
import StudentDoExerciseRepositoryInterface from "./studentDoExercise.repository.interface";


class StudentDoExerciseRepositoryImpl implements StudentDoExerciseRepositoryInterface {
  async findMaxScoreDoExerciseByStudentAndCourse(studentId: number, courseSlug: string): Promise<StudentDoExercise[]> {
    const result = await StudentDoExercise.createQueryBuilder('sde')
      .setLock("pessimistic_read")
      .useTransaction(true)
      .leftJoin(
        qb =>
          qb.from(StudentDoExercise, "inner")
            .select("max(score)", "maxScore")
            .addSelect('studentId')
            .addSelect("exerciseId")
            .groupBy('studentId, exerciseId'),
        'maxScoreTable',
        'maxScoreTable.studentId = sde.studentId AND maxScoreTable.exerciseId = sde.exerciseId'
      )
      .leftJoinAndSelect("sde.student", "student")
      .leftJoinAndSelect("student.user", "userStudent")
      .leftJoinAndSelect("sde.exercise", "exercise")
      .leftJoinAndSelect("exercise.course", "course")
      .where("sde.score = maxScore")
      .andWhere("userStudent.id = :studentId", { studentId })
      .andWhere("course.slug = :courseSlug", { courseSlug })
      .orderBy("sde.startTime", "DESC")
      .getMany();
    const exerciseIds = [];
    const filteredResult = [];
    for (const data of result) {
      if (exerciseIds.find(id => id === data.exercise.id) === undefined) {
        exerciseIds.push(data.exercise.id);
        filteredResult.push(data);
      }
    }
    return filteredResult;
  }
}


const StudentDoExerciseRepository = new StudentDoExerciseRepositoryImpl();
export default StudentDoExerciseRepository;