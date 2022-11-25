import {
  Entity,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
  ManyToOne,
} from "typeorm";
import { MyBaseEntity } from "./MyBaseEntity";
import { Transaction } from "./Transaction";
import { UserStudent } from "./UserStudent";
import { Course } from "./Course";

@Entity()
export class Fee extends MyBaseEntity {
  @PrimaryGeneratedColumn()
  id: number;


  @OneToOne(() => Transaction, {
    nullable: false,
    onUpdate: "CASCADE",
    onDelete: "RESTRICT",
  })
  @JoinColumn()
  transCode: Transaction;


  @ManyToOne(() => UserStudent, {
    nullable: false,
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "studentId" })
  userStudent: UserStudent;

  
  @ManyToOne(() => Course, {
    onUpdate: "CASCADE",
    onDelete: "SET NULL",
  })
  @JoinColumn()
  course: Course | null;
}
