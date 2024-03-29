import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  JoinColumn,
  ManyToOne,
  Index,
} from "typeorm";
import {
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Length,
} from "class-validator";
import { MyBaseEntity } from "./MyBaseEntity";
import { Document } from "./Document";
import { StudySession } from "./StudySession";
import { Exercise } from "./Exercise";
import { UserTeacher } from "./UserTeacher";
import { Curriculum } from "./Curriculum";
import { StudentParticipateCourse } from "./StudentParticipateCourse";
import { Branch } from "./Branch";

@Entity()
export class Course extends MyBaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @IsNotEmpty()
  @IsString()
  @Length(0, 255)
  @Column({ length: 255, nullable: false, unique: true })
  slug: string;

  @Index()
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
  @IsNumber()
  @IsPositive()
  @Column({
    type: "decimal",
    nullable: false,
    transformer: {
      to(value) { return value; },
      from(value) { return parseFloat(value); },
    },
  })
  price: number;

  @Index()
  @IsNotEmpty()
  @IsDate()
  @Column({ type: "date", nullable: false })
  openingDate: Date;

  @Index()
  @IsOptional()
  @IsDate()
  @Column({ type: "timestamp", precision: 6, nullable: true })
  closingDate: Date | null;

  @Index()
  @IsNotEmpty()
  @IsDate()
  @Column({ type: "date", nullable: false })
  expectedClosingDate: Date;

  @IsNotEmpty()
  @IsString()
  @Length(0, 255)
  @Column({ length: 255, nullable: false })
  image: string;

  @Index()
  @IsOptional()
  @IsDate()
  @Column({  type: "timestamp", precision: 6, nullable: true })
  lockTime: Date | null;

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  @Column({ type: "integer", nullable: false })
  sessionPerWeek: number;

  //Relation Cuorse--1--<has>==N==Document
  @OneToMany(() => Document, (document) => document.course)
  documents: Document[];

  //Relation Course--1--<include>==N==StudySession
  @OneToMany(() => StudySession, (studySession) => studySession.course)
  studySessions: StudySession[];

  @OneToMany(() => Exercise, (exercise) => exercise.course, {
    nullable: false,
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
  })
  exercises: Exercise[];

  @IsNotEmpty()
  @ManyToOne(() => UserTeacher, (userTeacher) => userTeacher.courses, {
    nullable: false,
    onUpdate: "CASCADE",
    onDelete: "RESTRICT",
  })
  @JoinColumn()
  teacher: UserTeacher;

  @IsNotEmpty()
  @ManyToOne(() => Curriculum, {
    nullable: false,
    onUpdate: "CASCADE",
    onDelete: "RESTRICT",
  })
  @JoinColumn()
  curriculum: Curriculum;

  @IsOptional()
  @ManyToOne(() => Branch, {
    nullable: true,
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
  })
  @JoinColumn()
  branch: Branch;

  @OneToMany(() => StudentParticipateCourse, (studentPaticipateCourse) => studentPaticipateCourse.course)
  studentPaticipateCourses: StudentParticipateCourse[];
}
