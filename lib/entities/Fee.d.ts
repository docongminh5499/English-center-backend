import { MyBaseEntity } from "./MyBaseEntity";
import { Money } from "./Money";
export declare class Fee extends MyBaseEntity {
    id: number;
    content: string;
    amount: number;
    transCode: string;
    dueDate: Date;
    money: Money;
}
