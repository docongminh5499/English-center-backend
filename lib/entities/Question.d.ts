import { MyBaseEntity } from "./MyBaseEntity";
export declare class Question extends MyBaseEntity {
    id: number;
    quesContent: string;
    answer: string;
    imgSrc: string;
    audioSrc: string;
}
