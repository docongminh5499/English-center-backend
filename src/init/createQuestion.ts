import { faker } from "@faker-js/faker";
import { Question } from "../entities/Question";
import { Tag } from "../entities/Tag";
import { WrongAnswer } from "../entities/WrongAnswer";

export const createQuestion = async (tags: Tag[]) => {
    const questions = [];
    for (let index = 0; index < 3; index++) {
        let question = new Question();
        question.quesContent = faker.lorem.paragraphs();
        question.answer = faker.lorem.sentence();
        question.tags = tags;
        question = await question.save();

        for (let j = 0; j < 3; j++) {
            let wrongAnswer = new WrongAnswer();
            wrongAnswer.answer = faker.lorem.sentence();
            wrongAnswer.question = question;
            wrongAnswer = await wrongAnswer.save();
        }

        questions.push(question);
    }
    return questions;
}