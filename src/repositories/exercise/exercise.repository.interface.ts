import { Exercise } from "../../entities/Exercise";
import Pageable from "../helpers/pageable";

export default interface ExerciseRepository {
    findExerciseById: (exerciseId: number) => Promise<Exercise | null>;

    findExercisesByCourseSlug: (courseSlug: string, pageable: Pageable) => Promise<Exercise[]>;

    countExercisesByCourseSlug: (courseSlug: string) => Promise<number>;

    deleteExercise : (exerciseId: number) => Promise<boolean>;
}