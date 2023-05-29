import { faker } from "@faker-js/faker";
import { Tag } from "../entities/Tag";
import { QuestionStore } from "../entities/QuestionStore";
import { WrongAnswerStore } from "../entities/WrongAnswerStore";

export const createQuestionStore = async (tags: Tag[]) => {
    const questions = [];
    for (let index = 0; index < 3; index++) {
        let question = new QuestionStore();
        question.quesContent = faker.lorem.paragraphs();
        question.answer = faker.lorem.sentence();
        question.tags = tags;
        question = await question.save();

        for (let j = 0; j < 3; j++) {
            let wrongAnswer = new WrongAnswerStore();
            wrongAnswer.answer = faker.lorem.sentence();
            wrongAnswer.questionStore = question;
            wrongAnswer = await wrongAnswer.save();
        }

        questions.push(question);
    }
    return questions;
}