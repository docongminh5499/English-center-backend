import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  JoinTable,
  ManyToOne,
  JoinColumn,
  ManyToMany,
} from "typeorm";
import { IsDate, IsNotEmpty, IsNumber, IsOptional, IsString, Length } from "class-validator";
import { MyBaseEntity } from "./MyBaseEntity";
import { Question } from "./Question";
import { Course } from "./Course";
import { Lecture } from "./Lecture";

@Entity()
export class Exercise extends MyBaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @IsNotEmpty()
  @IsString()
  @Length(0, 255)
  @Column({ length: 255, nullable: false })
  name: string;

  @IsOptional()
  @IsDate()
  @Column({ type: "timestamp", precision: 6, nullable: false })
  openTime: Date;

  @IsOptional()
  @IsDate()
  @Column({ type: "timestamp", precision: 6, nullable: false })
  endTime: Date;

  @IsOptional()
  @IsNumber()
  @Column({ type: "integer", default: 3, nullable: false })
  maxTime: number;

  @ManyToMany(() => Question, (question) => question.exercises, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinTable({ name: "exercise_contain_question" })
  questions: Question[];

  @ManyToOne(() => Course, (course) => course.exercises, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn({ name: "courseId" })
  course: Course;

  @IsNotEmpty()
  @ManyToOne(() => Lecture, {onDelete: "CASCADE", onUpdate: "CASCADE", nullable: false})
  @JoinColumn({name: "lectureId"})
  lecture: Lecture;
}
