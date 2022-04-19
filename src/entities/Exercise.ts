import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
} from "typeorm";
import { IsDate, IsEnum, IsNotEmpty, IsNumber } from "class-validator";
import { MyBaseEntity } from "./MyBaseEntity";
import { ExerciseStatus } from "../utils/constants/exercise.constant";
import { Question } from "./Question";

@Entity()
export class Exercise extends MyBaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @IsDate()
  @Column({ type: "timestamp", nullable: true })
  openTime: Date;

  @IsDate()
  @Column({ type: "timestamp", nullable: true })
  endTime: Date;

  @IsNotEmpty()
  @IsEnum(ExerciseStatus)
  @Column({ type: "enum", enum: ExerciseStatus, nullable: false })
  status: ExerciseStatus;

  @IsNumber()
  @Column({ type: "integer", default: 3 })
  maxTime: number;

  @ManyToMany(() => Question, {onDelete: "RESTRICT", onUpdate: "CASCADE"})
  @JoinTable({ name: "exercise_contain_question" })
  questions: Question[];
}
