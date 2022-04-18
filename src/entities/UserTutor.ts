import { Entity, JoinTable, ManyToMany, OneToMany } from "typeorm";
import { Shift } from "./Shift";
import { StudySession } from "./StudySession";
import { Worker } from "./Worker";


@Entity()
export class UserTutor extends Worker {

  //Relation: Tutor--N--<Free In>--N--Shift
  @ManyToMany(() => Shift, (shift) => shift.tutors, {onDelete: "CASCADE", onUpdate: "CASCADE"})
  @JoinTable({name: "TutorFreeInShift"})
  shifts: Shift[];

  //Relation Tutor--1--<Teach>==N==<StudySession>
  @OneToMany(() => StudySession, (studySession) => studySession.tutor)
  studySessions: StudySession[];
}