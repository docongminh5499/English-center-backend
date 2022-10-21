import { StudentDoExercise } from "../../entities/StudentDoExercise";

export default interface StudentDoExerciseRepository {
    findMaxScoreDoExerciseByStudentAndCourse: (studentId: number, courseSlug: string) => Promise<StudentDoExercise[]>;
}