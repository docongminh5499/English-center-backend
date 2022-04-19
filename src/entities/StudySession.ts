import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, ManyToMany, JoinTable } from "typeorm";
import { IsBoolean, IsDate, IsNotEmpty, IsString, Length } from "class-validator";
import { MyBaseEntity } from "./MyBaseEntity";
import { Lecture } from "./Lecture";
import { Course } from "./Course";
import { Shift } from "./Shift";
import { UserTutor } from "./UserTutor";

@Entity()
export class StudySession extends MyBaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @IsNotEmpty()
  @IsString()
  @Length(0, 255)
  @Column({ length: 255, nullable: false })
  name: string;

  @IsNotEmpty()
  @IsDate()
  @Column({ type: "timestamp", nullable: false })
  date: Date;
  
  @IsNotEmpty()
  @IsBoolean()
  @Column({ type: "boolean", nullable: false })
  isTeacherAbsent: boolean

  //Relation StudySession==N==<has>--1--Lecture
  @ManyToOne(() => Lecture, (lecture) => lecture.studySessions, {nullable: false, onDelete: "RESTRICT", onUpdate: "CASCADE"})
  lecture: Lecture;

  //Relation Course--1--<include>==N==StudySession
  @ManyToOne(() => Course, (course) => course.studySessions, {nullable: false, onDelete: "RESTRICT", onUpdate: "CASCADE"})
  course: Course;

  //Relation StudySession==N==<belong to>--N--Shift
  @ManyToMany(() => Shift, (shift) => shift.studySessions, {onDelete: "RESTRICT", onUpdate: "CASCADE"})
  @JoinTable({name: "study_session_belong_to_shift"})
  shifts: Shift[];

  //Relation Tutor--1--<Teach>==N==<StudySession>
  @ManyToOne(() => UserTutor, (tutor) => tutor.studySessions, {nullable: false, onDelete: "NO ACTION", onUpdate: "CASCADE"})
  tutor: UserTutor;
}