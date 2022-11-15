import { IsDate, IsNotEmpty, IsString, Length } from "class-validator";
import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { MyBaseEntity } from "./MyBaseEntity";
import { Transaction } from "./Transaction";
import { UserEmployee } from "./UserEmployee";

@Entity()
export class Refund extends MyBaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @IsString()
    @Length(0, 50)
    @OneToOne(() => Transaction, {
        nullable: false,
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
    })
    @JoinColumn()
    transCode: Transaction;


    @ManyToOne(() => UserEmployee, {
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
    })
    @JoinColumn({ name: "employeeId" })
    userEmployee: UserEmployee;

    @IsNotEmpty()
    @IsDate()
    @Column({ type: "timestamp", precision: 6, nullable: false })
    refundDate: Date;
}
