import { faker } from "@faker-js/faker";
import { Course } from "../entities/Course";
import { Exercise } from "../entities/Exercise";
import { StudentDoExercise } from "../entities/StudentDoExercise";
import { StudentParticipateCourse } from "../entities/StudentParticipateCourse";
import { ExerciseStatus } from "../utils/constants/exercise.constant";
import { getExerciseStatus } from "../utils/functions/getExerciseStatus";

export async function createStudentDoExercise(course: Course, exercises: Exercise[], participations: StudentParticipateCourse[]) {
  const doExercises = [];
  for (const participation of participations) {
    for (const exercise of exercises) {
      if (getExerciseStatus(exercise.openTime, exercise.endTime) === ExerciseStatus.NotOpen)
        continue;

      const numberOfDoingExercise = faker.datatype.number({ min: 1, max: exercise.maxTime });
      for (let time = 0; time < numberOfDoingExercise; time++) {
        let studentDoExercise = new StudentDoExercise();
        studentDoExercise.student = participation.student;
        studentDoExercise.exercise = exercise;
        studentDoExercise.score = faker.datatype.float({ min: 5.0, max: 10.0, precision: 0.1 })

        const endTime = exercise.endTime;
        studentDoExercise.startTime = faker.datatype.datetime({
          min: exercise.openTime.getTime(),
          max: endTime.getTime(),
        });
        studentDoExercise.endTime = faker.datatype.datetime({
          min: studentDoExercise.startTime.getTime(),
          max: endTime.getTime(),
        });
        studentDoExercise = await StudentDoExercise.save(studentDoExercise);
        doExercises.push(studentDoExercise);
      }
    }
  }
  console.log(`Created ${doExercises.length} student do exercises`);
  return doExercises;
}