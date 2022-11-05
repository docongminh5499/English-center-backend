import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from "typeorm";
import { IsBoolean, IsNotEmpty, IsString } from "class-validator";
import { MyBaseEntity } from "./MyBaseEntity";
import { UserStudent } from "./UserStudent";
import { StudySession } from "./StudySession";

//Relation Student--N--<Attend>--N--StudySession
@Entity()
export class UserAttendStudySession extends MyBaseEntity {


  @PrimaryColumn({ type: "int", name: "studentId" })
  @ManyToOne(() => UserStudent, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn({ name: "studentId" })
  student: UserStudent;

  @PrimaryColumn({ type: "int", name: "studySessionId" })
  @ManyToOne(() => StudySession, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn({ name: "studySessionId" })
  studySession: StudySession;

  @IsNotEmpty()
  @IsBoolean()
  @Column({ type: "boolean", nullable: false })
  isAttend: boolean;

  @IsNotEmpty()
  @IsString()
  @Column({ type: "text", nullable: false })
  commentOfTeacher: string;

}