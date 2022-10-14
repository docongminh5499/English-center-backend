import { DeleteResult } from "typeorm";
import { Exercise } from "../../entities/Exercise";
import Pageable from "../helpers/pageable";
import ExerciseRepositoryInterface from "./exercise.repository.interface";

class ExerciseRepositoryImpl implements ExerciseRepositoryInterface {
  async findExerciseById(exerciseId: number): Promise<Exercise | null> {
    const exercise = await Exercise
      .findOne({
        where: { id: exerciseId },
        relations: ["course"]
      });
    return exercise;
  }


  async findExercisesByCourseSlug(courseSlug: string, pageable: Pageable): Promise<Exercise[]> {
    let queryStmt = Exercise.createQueryBuilder('exercise')
      .leftJoinAndSelect("exercise.course", "course")
      .where("course.slug = :courseSlug", { courseSlug })
      .orderBy({ "-openTime": "ASC" })
    queryStmt = pageable.buildQuery(queryStmt);
    return await queryStmt.getMany();
  }



  async countExercisesByCourseSlug(courseSlug: string): Promise<number> {
    let queryStmt = Exercise.createQueryBuilder('exercise')
      .leftJoinAndSelect("exercise.course", "course")
      .where("course.slug = :courseSlug", { courseSlug })
    return await queryStmt.getCount();
  }



  async deleteExercise(exerciseId: number): Promise<boolean> {
    const result: DeleteResult = await Exercise
      .createQueryBuilder()
      .delete()
      .where("id = :exerciseId", { exerciseId })
      .execute();
    return result.affected !== undefined
      && result.affected !== null
      && result.affected > 0;
  }
}


const ExerciseRepository = new ExerciseRepositoryImpl();
export default ExerciseRepository;