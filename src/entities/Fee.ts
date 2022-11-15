import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  ManyToOne,
} from "typeorm";
import {
  IsDate,
  IsNotEmpty,
  IsString,
  Length,
} from "class-validator";
import { MyBaseEntity } from "./MyBaseEntity";
import { Transaction } from "./Transaction";
import { UserStudent } from "./UserStudent";
import { UserEmployee } from "./UserEmployee";
import { Course } from "./Course";

@Entity()
export class Fee extends MyBaseEntity {
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

  @ManyToOne(() => UserEmployee, {
    onUpdate: "CASCADE",
    onDelete: "RESTRICT",
  })
  @JoinColumn({ name: "employeeId" })
  userEmployee: UserEmployee;

  @IsNotEmpty()
  @IsDate()
  @Column({ type: "timestamp", precision: 6, nullable: false })
  payDate: Date;
}
