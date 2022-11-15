import {
  Entity,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
  ManyToOne,
  Column,
} from "typeorm";
import {
  IsDate,
  IsNotEmpty,
  IsString,
  Length,
} from "class-validator";
import { MyBaseEntity } from "./MyBaseEntity";
import { Transaction } from "./Transaction";
import { Worker } from "./Worker";

@Entity()
export class Salary extends MyBaseEntity {
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

  @ManyToOne(() => Worker, {onDelete: "RESTRICT", onUpdate: "CASCADE", nullable: false})
  @JoinColumn({name: "workerId"})
  worker: Worker;

  @IsNotEmpty()
  @IsDate()
  @Column({ type: "timestamp", precision: 6, nullable: false })
  payDate: Date;
}
