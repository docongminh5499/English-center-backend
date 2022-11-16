import {
  Entity,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
  ManyToOne,
} from "typeorm";
import {
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

  
  @ManyToOne(() => Worker, { onDelete: "RESTRICT", onUpdate: "CASCADE", nullable: false })
  @JoinColumn({ name: "workerId" })
  worker: Worker;
}
