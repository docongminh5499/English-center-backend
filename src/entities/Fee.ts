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

  @IsNotEmpty()
  @OneToOne(() => Course, {
    nullable: false,
    onUpdate: "CASCADE",
    onDelete: "RESTRICT",
  })
  @JoinColumn()
  course: Course;

  @ManyToOne(() => UserEmployee, {
    onUpdate: "CASCADE",
    onDelete: "NO ACTION",
  })
  @JoinColumn({ name: "employeeId" })
  userEmployee: UserEmployee;

  @IsDate()
  @Column({ type: "timestamp", precision: 6, nullable: true })
  payDate: Date | null;
}
