import { faker } from "@faker-js/faker";
import { Question } from "../entities/Question";
import { Tag } from "../entities/Tag";
import { WrongAnswer } from "../entities/WrongAnswer";

export const createQuestion = async (tags: Tag[]) => {
    const questions = [];
    for (let index = 0; index < 3; index++) {
        const question = new Question();
        question.quesContent = faker.lorem.paragraph();
        question.answer = faker.lorem.sentence();
        question.tags = tags;
        await question.save();

        for (let j = 0; j < 3; j++) {
            const wrongAnswer = new WrongAnswer();
            wrongAnswer.answer = faker.lorem.sentence();
            wrongAnswer.question = question;
            await wrongAnswer.save();
        }

        questions.push(question);
    }
    return questions;
}