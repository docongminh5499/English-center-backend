import { Entity, Column, PrimaryColumn, JoinColumn, ManyToOne } from "typeorm";
import { IsBoolean, IsNotEmpty, IsString } from "class-validator";
import { MyBaseEntity } from "./MyBaseEntity";
import { UserStudent } from "./UserStudent";
import { StudySession } from "./StudySession";

//Relation Student--1--<Học bù>--1--StudySession
//                         1
// It's actually OneToOne, but TypeORM create unique constraint by default, 
// so I change to ManyToOne and add unique constraint
@Entity()
export class MakeUpLession extends MyBaseEntity {


  @PrimaryColumn({ type: "int", name: "studentId", unique: false })
  @ManyToOne(() => UserStudent, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn({ name: "studentId" })
  student: UserStudent;

  @PrimaryColumn({ type: "int", name: "studySessionId", unique: false })
  @ManyToOne(() => StudySession, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn({ name: "studySessionId" })
  studySession: StudySession;           // Buổi được bù

  @PrimaryColumn({ type: "int", name: "targetStudySessionId", unique: false })
  @ManyToOne(() => StudySession, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn({ name: "targetStudySessionId" })
  targetStudySession: StudySession;    // Buổi dùng để bù

  @IsNotEmpty()
  @IsBoolean()
  @Column({ type: "boolean", nullable: false })
  isAttend: boolean;

  @IsNotEmpty()
  @IsString()
  @Column({ type: "text", nullable: false })
  commentOfTeacher: string;

}