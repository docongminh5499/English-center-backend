import { MyBaseEntity } from "./MyBaseEntity";
import { Question } from "./Question";
export declare class WrongAnswer extends MyBaseEntity {
    id: number;
    answer: string;
    question: Question;
}
