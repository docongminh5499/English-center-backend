import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from "typeorm";
import { IsBoolean, IsNotEmpty, IsString } from "class-validator";
import { MyBaseEntity } from "./MyBaseEntity";
import { UserStudent } from "./UserStudent";
import { StudySession } from "./StudySession";

//Relation Student--N--<Học bù>--N--StudySession
@Entity()
export class MakeUpLession extends MyBaseEntity {

  
  @PrimaryColumn({type: "int", name:"studentId"})
  @ManyToOne(() => UserStudent)
  @JoinColumn()
  student: UserStudent;

  @PrimaryColumn({type: "int", name:"studySessionId"})
  @ManyToOne(() => StudySession)
  @JoinColumn()
  studySession: StudySession;
  
  @IsBoolean()
  @IsNotEmpty()
  @Column({type: "boolean", nullable: false})
  isAttend: boolean;

  @IsNotEmpty()
  @IsString()
  @Column({ type: "text", nullable: false })
  commentOfTeacher: string;
  
}