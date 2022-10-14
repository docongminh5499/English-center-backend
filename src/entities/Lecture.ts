import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
} from "typeorm";
import { IsNotEmpty, IsNumber, IsString, Length, Min } from "class-validator";
import { MyBaseEntity } from "./MyBaseEntity";
import { StudySession } from "./StudySession";
import { Curriculum } from "./Curriculum";

@Entity()
export class Lecture extends MyBaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @Column({ type: "int", nullable: false })
  order: number;

  @IsNotEmpty()
  @IsString()
  @Length(0, 255)
  @Column({ length: 255, nullable: false })
  name: string;

  //Description
  @IsString()
  @Column({ type: "text", nullable: true })
  desc: string | null;

  @IsNotEmpty()
  @IsString()
  @Column({ type: "text", nullable: false })
  detail: string;

  //Relation StudySession==N==<has>--1--Lecture
  @OneToMany(() => StudySession, (studySession) => studySession.lecture)
  studySessions: StudySession[];

  @IsNotEmpty()
  @ManyToOne(() => Curriculum, {
    nullable: false,
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
  })
  curriculum: Curriculum;
}
