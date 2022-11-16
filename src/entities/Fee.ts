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
import { UserStudent } from "./UserStudent";
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
}
