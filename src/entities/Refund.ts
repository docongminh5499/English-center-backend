import { IsString, Length } from "class-validator";
import { Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Fee } from "./Fee";
import { MyBaseEntity } from "./MyBaseEntity";
import { Transaction } from "./Transaction";

@Entity()
export class Refund extends MyBaseEntity {
    @PrimaryGeneratedColumn()
    id: number;


    @IsString()
    @Length(0, 50)
    @OneToOne(() => Transaction, { nullable: false, onUpdate: "CASCADE", onDelete: "RESTRICT" })
    @JoinColumn()
    transCode: Transaction;


    @OneToOne(() => Fee, { onUpdate: "CASCADE", onDelete: "RESTRICT" })
    @JoinColumn({ name: "feeTransCode" })
    fee: Fee;
}
