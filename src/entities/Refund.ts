import { Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Fee } from "./Fee";
import { MyBaseEntity } from "./MyBaseEntity";
import { Transaction } from "./Transaction";

@Entity()
export class Refund extends MyBaseEntity {
    @PrimaryGeneratedColumn()
    id: number;


    @OneToOne(() => Transaction, { nullable: false, onUpdate: "CASCADE", onDelete: "RESTRICT" })
    @JoinColumn()
    transCode: Transaction;


    @OneToOne(() => Fee, { onUpdate: "CASCADE", onDelete: "RESTRICT" })
    @JoinColumn({ name: "feeTransCode" })
    fee: Fee;
}
