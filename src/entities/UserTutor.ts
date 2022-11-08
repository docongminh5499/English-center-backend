import { IsNotEmpty, IsString, Length } from "class-validator";
import { Column, Entity, JoinColumn, JoinTable, ManyToMany, OneToMany, OneToOne, PrimaryColumn } from "typeorm";
import { MyBaseEntity } from "./MyBaseEntity";
import { Shift } from "./Shift";
import { StudySession } from "./StudySession";
import { Worker } from "./Worker";

@Entity()
export class UserTutor extends MyBaseEntity {
  @IsNotEmpty()
  @IsString()
  @Length(0, 255)
  @Column({ length: 255, nullable: false, unique: true })
  slug: string;

  @PrimaryColumn({ type: "int", name: "tutorId" })
  @OneToOne(() => Worker, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn({ name: "tutorId" })
  worker: Worker;

  //Relation: Tutor--N--<Free In>--N--Shift
  @ManyToMany(() => Shift, (shift) => shift.tutors, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinTable({ name: "tutor_free_in_shift" })
  shifts: Shift[];

  //Relation Tutor--1--<Teach>==N==<StudySession>
  @OneToMany(() => StudySession, (studySession) => studySession.tutor)
  studySessions: StudySession[];
}
