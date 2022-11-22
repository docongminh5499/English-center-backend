import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, ManyToMany, JoinTable, JoinColumn, Index } from "typeorm";
import { IsDate, IsNotEmpty, IsOptional, IsString, Length } from "class-validator";
import { MyBaseEntity } from "./MyBaseEntity";
import { Course } from "./Course";
import { Shift } from "./Shift";
import { UserTutor } from "./UserTutor";
import { Classroom } from "./Classroom";
import { UserTeacher } from "./UserTeacher";

@Entity()
@Index(["date", "tutor"])
@Index(["date", "teacher"])
@Index(["date", "course"])
export class StudySession extends MyBaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @IsNotEmpty()
  @IsString()
  @Length(0, 255)
  @Column({ length: 255, nullable: false })
  name: string;

  @Index()
  @IsNotEmpty()
  @IsDate()
  @Column({ type: "date", nullable: false })
  date: Date;

  @IsOptional()
  @IsString()
  @Column({ type: "text", nullable: true })
  notes: string | null;

  //Relation Course--1--<include>==N==StudySession
  @IsOptional()
  @ManyToOne(() => Course, (course) => course.studySessions, { nullable: true, onDelete: "CASCADE", onUpdate: "CASCADE" })
  course: Course;

  //Relation StudySession==N==<belong to>--N--Shift
  @ManyToMany(() => Shift, (shift) => shift.studySessions, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinTable({ name: "study_session_belong_to_shift" })
  shifts: Shift[];

  //Relation Tutor--1--<Teach>==N==<StudySession>
  @ManyToOne(() => UserTutor, (tutor) => tutor.studySessions, { nullable: false, onDelete: "RESTRICT", onUpdate: "CASCADE" })
  tutor: UserTutor;


  @IsNotEmpty()
  @ManyToOne(() => UserTeacher, (userTeacher) => userTeacher.studySessions, {
    nullable: false,
    onUpdate: "CASCADE",
    onDelete: "RESTRICT",
  })
  @JoinColumn()
  teacher: UserTeacher;

  @ManyToOne(() => Classroom, {
    onUpdate: "CASCADE",
    onDelete: "SET NULL",
  })
  @JoinColumn([
    { name: "classroomName", referencedColumnName: "name" },
    { name: "branchId", referencedColumnName: "branch" },
  ])
  classroom: Classroom | null;
}