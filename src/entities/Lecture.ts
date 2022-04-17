import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { IsNotEmpty, IsString, Length } from "class-validator";
import { MyBaseEntity } from "./MyBaseEntity";
import { StudySession } from "./StudySession";

@Entity()
export class Lecture extends MyBaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @IsNotEmpty()
  @IsString()
  @Length(0, 255)
  @Column({ length: 255, nullable: false })
  name: string;

  //Description
  @IsNotEmpty()
  @IsString()
  @Column({ type: "text", nullable: false })
  desc: string;

  //Relation StudySession==N==<has>--1--Lecture
  @OneToMany(() => StudySession, (studySession) => studySession.lecture)
  studySessions: StudySession[];
}