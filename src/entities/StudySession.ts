import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, ManyToMany, JoinTable, JoinColumn } from "typeorm";
import { IsBoolean, IsDate, IsNotEmpty, IsString, Length, IsEnum } from "class-validator";
import { MyBaseEntity } from "./MyBaseEntity";
import { Lecture } from "./Lecture";
import { Course } from "./Course";
import { Shift } from "./Shift";
import { UserTutor } from "./UserTutor";
import { StudySessionState } from "../utils/constants/studySession.constant";
import { Classroom } from "./Classroom";
import { UserTeacher } from "./UserTeacher";

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
  @Column({ type: "timestamp", precision: 6, nullable: false })
  date: Date;

  @IsNotEmpty()
  @IsBoolean()
  @Column({ type: "boolean", nullable: false })
  isTeacherAbsent: boolean

  @IsString()
  @Column({ type: "text", nullable: true })
  notes: string | null;

  @IsNotEmpty()
  @IsEnum(StudySessionState)
  @Column({ type: "enum", enum: StudySessionState, nullable: false })
  state: StudySessionState;

  @IsBoolean()
  @Column({ type: "boolean", default: true, nullable: true })
  isSystemCreated: boolean | null;

  //Relation StudySession==N==<has>--1--Lecture
  @IsNotEmpty()
  @ManyToOne(() => Lecture, (lecture) => lecture.studySessions, { nullable: false, onDelete: "RESTRICT", onUpdate: "CASCADE" })
  lecture: Lecture;

  //Relation Course--1--<include>==N==StudySession
  @IsNotEmpty()
  @ManyToOne(() => Course, (course) => course.studySessions, { nullable: false, onDelete: "RESTRICT", onUpdate: "CASCADE" })
  course: Course;

  //Relation StudySession==N==<belong to>--N--Shift
  @ManyToMany(() => Shift, (shift) => shift.studySessions, { onDelete: "RESTRICT", onUpdate: "CASCADE" })
  @JoinTable({ name: "study_session_belong_to_shift" })
  shifts: Shift[];

  //Relation Tutor--1--<Teach>==N==<StudySession>
  @ManyToOne(() => UserTutor, (tutor) => tutor.studySessions, { nullable: false, onDelete: "NO ACTION", onUpdate: "CASCADE" })
  tutor: UserTutor;


  @IsNotEmpty()
  @ManyToOne(() => UserTeacher, (userTeacher) => userTeacher.studySessions, {
    nullable: false,
    onUpdate: "CASCADE",
    onDelete: "RESTRICT",
  })
  @JoinColumn()
  teacher: UserTeacher;

  @IsNotEmpty()
  @ManyToOne(() => Classroom, {
    nullable: false,
    onUpdate: "CASCADE",
    onDelete: "RESTRICT",
  })
  @JoinColumn([
    { name: "classroomName", referencedColumnName: "name" },
    { name: "branchId", referencedColumnName: "branch" },
  ])
  classroom: Classroom;
}