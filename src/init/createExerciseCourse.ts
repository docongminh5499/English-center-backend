import { faker } from "@faker-js/faker";
import { Course } from "../entities/Course";
import { Exercise } from "../entities/Exercise";

export const createExercise = async (course: Course) => {
    const numberOfExercise = faker.datatype.number({ min: 1, max: 10 });
    const exercises = [];
    for (let index = 0; index < numberOfExercise; index++) {
        const exercise = new Exercise();
        exercise.name = faker.random.words();
        exercise.maxTime = faker.datatype.number({ min: 3, max: 6 });
        const openingDate = faker.datatype.datetime({
            min: (new Date(2019, 0, 1)).getTime(),
            max: (new Date(2022, 0, 1)).getTime(),
        });
        const closingDate = faker.datatype.datetime({
            min: openingDate.getTime(),
            max: (new Date(2023, 0, 1)).getTime(),
        });
        exercise.openTime = openingDate;
        exercise.endTime = closingDate;
        await exercise.save();
        exercises.push(exercise);
    }

    course.exercises = exercises;
    await course.save();
}