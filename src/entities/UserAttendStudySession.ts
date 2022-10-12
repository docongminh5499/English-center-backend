import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from "typeorm";
import { IsEnum, IsNotEmpty, IsString } from "class-validator";
import { MyBaseEntity } from "./MyBaseEntity";
import { UserStudent } from "./UserStudent";
import { StudySession } from "./StudySession";
import { AttendanceStatus } from "../utils/constants/attendance.constant";

//Relation Student--N--<Attend>--N--StudySession
@Entity()
export class UserAttendStudySession extends MyBaseEntity {


  @PrimaryColumn({ type: "int", name: "studentId" })
  @ManyToOne(() => UserStudent, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn({name: "studentId"})
  student: UserStudent;

  @PrimaryColumn({ type: "int", name: "studySessionId" })
  @ManyToOne(() => StudySession, { onDelete: "RESTRICT", onUpdate: "CASCADE" })
  @JoinColumn({name: "studySessionId"})
  studySession: StudySession;

  @IsNotEmpty()
  @IsEnum(AttendanceStatus)
  @Column({ type: "enum", enum: AttendanceStatus, nullable: false })
  isAttend: AttendanceStatus;

  @IsNotEmpty()
  @IsString()
  @Column({ type: "text", nullable: false })
  commentOfTeacher: string;

}