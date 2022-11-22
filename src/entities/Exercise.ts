import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { IsDate, IsNotEmpty, IsNumber, IsOptional, IsString, Length } from "class-validator";
import { MyBaseEntity } from "./MyBaseEntity";
import { Question } from "./Question";
import { Course } from "./Course";

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
  @Column({ type: "timestamp", precision: 6, nullable: true })
  openTime: Date | null;

  @IsOptional()
  @IsDate()
  @Column({ type: "timestamp", precision: 6, nullable: true })
  endTime: Date | null;

  @IsOptional()
  @IsNumber()
  @Column({ type: "integer", default: 3 })
  maxTime: number | null;

  @ManyToMany(() => Question, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinTable({ name: "exercise_contain_question" })
  questions: Question[];

  @ManyToOne(() => Course, (course) => course.exercises, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn({ name: "courseId" })
  course: Course;
}
