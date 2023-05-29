import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  JoinTable,
  ManyToOne,
  JoinColumn,
  ManyToMany,
} from "typeorm";
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Length,
} from "class-validator";
import { MyBaseEntity } from "./MyBaseEntity";
import { Lecture } from "./Lecture";
import { Curriculum } from "./Curriculum";
import { QuestionStore } from "./QuestionStore";

@Entity()
export class CurriculumExercise extends MyBaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @IsNotEmpty()
  @IsString()
  @Length(0, 255)
  @Column({ length: 255, nullable: false })
  name: string;

  @IsOptional()
  @IsNumber()
  @Column({ type: "integer", default: 3, nullable: false })
  maxTime: number;

  @IsOptional()
  @IsNumber()
  @Column({ type: "integer", default: 1, nullable: false })
  startWeek: number;

  

  @ManyToMany(() => QuestionStore, (question) => question.curriculumExercises, { onDelete: "CASCADE", onUpdate: "CASCADE", cascade: ["remove"] })
  @JoinTable({ name: "curriculum_exercise_contain_question" })
  questions: QuestionStore[];

  @ManyToOne(() => Curriculum, (curriculum) => curriculum.exercises, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn({ name: "curriculumId" })
  curriculum: Curriculum;

  @IsNotEmpty()
  @ManyToOne(() => Lecture, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
    nullable: false,
  })
  @JoinColumn({ name: "lectureId" })
  lecture: Lecture;
}
