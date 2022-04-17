import { MyBaseEntity } from "./MyBaseEntity";
import { Money } from "./Money";
export declare class Salary extends MyBaseEntity {
    id: number;
    content: string;
    amount: number;
    transCode: string;
    money: Money;
}
