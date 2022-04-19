import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToMany,
  JoinTable,
  JoinColumn,
  ManyToOne,
} from "typeorm";
import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  Length,
} from "class-validator";
import { MyBaseEntity } from "./MyBaseEntity";
import { TermCourse } from "../utils/constants/termCuorse.constant";
import { Document } from "./Document";
import { StudySession } from "./StudySession";
import { Exercise } from "./Exercise";
import { UserTeacher } from "./UserTeacher";
import { Curriculum } from "./Curriculum";
import { Schedule } from "./Schedule";

@Entity()
export class Course extends MyBaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @IsNotEmpty()
  @IsString()
  @Length(0, 255)
  @Column({ length: 255, nullable: false })
  name: string;

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  @Column({ nullable: false })
  maxNumberOfStudent: number;

  @IsNotEmpty()
  @IsEnum(TermCourse)
  @Column({
    type: "enum",
    enum: TermCourse,
    nullable: false,
    default: TermCourse.ShortTerm,
  })
  type: TermCourse;

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  @Column({ nullable: false })
  price: number;

  @IsNotEmpty()
  @IsDate()
  @Column({ type: "date", nullable: false })
  openingDate: Date;

  @IsNotEmpty()
  @IsDate()
  @Column({ type: "date", nullable: false })
  closingDate: Date;

  @IsNotEmpty()
  @IsString()
  @Length(0, 255)
  @Column({ length: 255, nullable: false })
  image: string;

  //Relation Cuorse--1--<has>==N==Document
  @OneToMany(() => Document, (document) => document.course)
  documents: Document[];

  //Relation Course--1--<include>==N==StudySession
  @OneToMany(() => StudySession, (studySession) => studySession.course)
  studySessions: StudySession[];

  @ManyToMany(() => Exercise, {onDelete: "RESTRICT", onUpdate: "CASCADE"})
  @JoinTable({ name: "course_contain_exercise" })
  exercises: Exercise[];

  @ManyToOne(() => UserTeacher, {
    nullable: false,
    onUpdate: "CASCADE",
    onDelete: "RESTRICT",
  })
  @JoinColumn()
  teacher: UserTeacher;

  @ManyToOne(() => Curriculum, {
    nullable: false,
    onUpdate: "CASCADE",
    onDelete: "RESTRICT",
  })
  @JoinColumn()
  curriculum: Curriculum;

  @OneToMany(() => Schedule, (schedule) => schedule.course)
  @JoinColumn()
  schedules: Schedule[];
}
