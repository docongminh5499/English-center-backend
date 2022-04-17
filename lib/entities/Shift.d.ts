import { Weekday } from "../utils/constants/weekday.constant";
import { MyBaseEntity } from "./MyBaseEntity";
export declare class Shift extends MyBaseEntity {
    id: number;
    weekDay: Weekday;
    startTime: Date;
    endTime: Date;
}
