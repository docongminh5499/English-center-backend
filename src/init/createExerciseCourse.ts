import { faker } from "@faker-js/faker";
import { Course } from "../entities/Course";
import { Exercise } from "../entities/Exercise";
import { Tag } from "../entities/Tag";
import { createQuestion } from "./createQuestion";

export const createExercise = async (course: Course, tags: Tag[]) => {
  const numberOfExercise = faker.datatype.number({ min: 4, max: 10 });
  const exercises = [];
  for (let index = 0; index < numberOfExercise; index++) {
    let exercise = new Exercise();
    exercise.name = faker.random.words();
    exercise.maxTime = faker.datatype.number({ min: 3, max: 6 });

    const status = course.closingDate !== null  // 1: Not Open, 2 Open, 3 Closed 
      ? 3 : (course.openingDate > new Date() ? 1 : faker.helpers.arrayElement([1, 2, 3]));
      
    let openingDate = null;
    let closingDate = null;
    if (status === 2 || status === 3) {
      openingDate = faker.datatype.datetime({
        min: course.openingDate.getTime(),
        max: course.expectedClosingDate.getTime(),
      });
      if (status === 3) {
        closingDate = faker.datatype.datetime({
          min: openingDate.getTime(),
          max: course.expectedClosingDate.getTime(),
        });
      }
    }
    exercise.openTime = openingDate;
    exercise.endTime = closingDate;
    const questions = await createQuestion(faker.helpers.arrayElements(tags, 3));
    exercise.questions = questions;

    exercise = await exercise.save();
    exercises.push(exercise);
  }

  course.exercises = exercises;
  await course.save();
  console.log(`Created ${exercises.length} exercises for course with id = ${course.id}`);
  return exercises;
}