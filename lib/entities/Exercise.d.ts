import { MyBaseEntity } from "./MyBaseEntity";
import { ExerciseStatus } from "../utils/constants/exercise.constant";
export declare class Exercise extends MyBaseEntity {
    id: number;
    openTime: Date;
    endTime: Date;
    status: ExerciseStatus;
    maxTime: number;
}
