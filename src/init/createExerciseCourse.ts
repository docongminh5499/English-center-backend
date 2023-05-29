import { faker } from "@faker-js/faker";
import { Course } from "../entities/Course";
import { Exercise } from "../entities/Exercise";
import { Tag } from "../entities/Tag";
import { createQuestion } from "./createQuestion";

export const createExercise = async (course: Course, tags: Tag[]) => {
  const numberOfExercise = faker.datatype.number({ min: 1, max: 2 });
  const exercises = [];
  const lectures = course.curriculum.lectures;
  for (const lecture of lectures) {
    for (let index = 0; index < numberOfExercise; index++) {
      let exercise = new Exercise();
      exercise.name = faker.random.words();
      exercise.maxTime = faker.datatype.number({ min: 3, max: 6 });

      let openingDate = faker.datatype.datetime({
        min: course.openingDate.getTime(),
        max: course.expectedClosingDate.getTime(),
      });
      let closingDate = faker.datatype.datetime({
        min: openingDate.getTime(),
        max: course.expectedClosingDate.getTime(),
      });

      exercise.openTime = openingDate;
      exercise.endTime = closingDate;
      const questions = await createQuestion(
        faker.helpers.arrayElements(tags, 3)
      );
      exercise.questions = questions;

      exercise.lecture = lecture;

      exercise = await exercise.save();
      exercises.push(exercise);
    }
  }

  course.exercises = exercises;
  await course.save();
  console.log(
    `Created ${exercises.length} exercises for course with id = ${course.id}`
  );
  return exercises;
};
