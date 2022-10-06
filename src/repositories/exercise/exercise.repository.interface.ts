import { Exercise } from "../../entities/Exercise";

export default interface ExerciseRepository {
    findExerciseById: (exerciseId: number) => Promise<Exercise | null>;

    deleteExercise : (exerciseId: number) => Promise<boolean>;
}