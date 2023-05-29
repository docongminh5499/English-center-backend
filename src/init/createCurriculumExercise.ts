import { faker } from "@faker-js/faker";
import { Tag } from "../entities/Tag";
import { Curriculum } from "../entities/Curriculum";
import { CurriculumExercise } from "../entities/CurriculumExercise";
import { createQuestionStore } from "./createQuestionStore";

export const createCurriculumExercise = async (curriculum: Curriculum, tags: Tag[]) => {
  const numberOfExercise = faker.datatype.number({ min: 1, max: 2 });
  const exercises = [];
  const lectures = curriculum.lectures;
  for (const lecture of lectures) {
    for (let index = 0; index < numberOfExercise; index++) {
      let exercise = new CurriculumExercise();
      exercise.name = faker.random.words();
      exercise.maxTime = faker.datatype.number({ min: 3, max: 6 });

      const questions = await createQuestionStore(
        faker.helpers.arrayElements(tags, 3)
      );
      exercise.questions = questions;

      exercise.lecture = lecture;

      exercise = await exercise.save();
      exercises.push(exercise);
    }
  }

  curriculum.exercises = exercises;
  await curriculum.save();
  console.log(
    `Created ${exercises.length} exercises for curriculum with id = ${curriculum.id}`
  );
  return exercises;
};
