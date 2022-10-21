import { StudentDoExercise } from "../../entities/StudentDoExercise";
import StudentDoExerciseRepositoryInterface from "./studentDoExercise.repository.interface";


class StudentDoExerciseRepositoryImpl implements StudentDoExerciseRepositoryInterface {
  async findMaxScoreDoExerciseByStudentAndCourse(studentId: number, courseSlug: string): Promise<StudentDoExercise[]> {
    const result = await StudentDoExercise.createQueryBuilder('sde')
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
      .getMany()
    return result;
  }
}


const StudentDoExerciseRepository = new StudentDoExerciseRepositoryImpl();
export default StudentDoExerciseRepository;