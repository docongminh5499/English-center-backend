import { Entity, Column, PrimaryColumn, JoinColumn, OneToOne } from "typeorm";
import { IsBoolean, IsNotEmpty, IsString } from "class-validator";
import { MyBaseEntity } from "./MyBaseEntity";
import { UserStudent } from "./UserStudent";
import { StudySession } from "./StudySession";

//Relation Student--1--<Học bù>--1--StudySession
//                         1
@Entity()
export class MakeUpLession extends MyBaseEntity {

  
  @PrimaryColumn({type: "int", name:"studentId"})
  @OneToOne(() => UserStudent, {onDelete: "CASCADE", onUpdate: "CASCADE"})
  @JoinColumn({name: "studentId"})
  student: UserStudent;

  @PrimaryColumn({type: "int", name:"studySessionId"})
  @OneToOne(() => StudySession, {onDelete: "RESTRICT", onUpdate: "CASCADE"})
  @JoinColumn({name: "studySessionId"})
  studySession: StudySession;
  
  @PrimaryColumn({type: "int", name:"targetStudySessionId"})
  @OneToOne(() => StudySession, {onDelete: "RESTRICT", onUpdate: "CASCADE"})
  @JoinColumn({name: "targetStudySessionId"})
  targetStudySession: StudySession;    // Buổi học nghỉ phải học bù

  @IsNotEmpty()
  @IsBoolean()
  @Column({type: "boolean", nullable: false})
  isAttend: boolean;

  @IsNotEmpty()
  @IsString()
  @Column({ type: "text", nullable: false })
  commentOfTeacher: string;
  
}