import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from "typeorm";
import { IsEnum, IsNotEmpty } from "class-validator";
import { Weekday } from "../utils/constants/weekday.constant";
import { MyBaseEntity } from "./MyBaseEntity";
import { StudySession } from "./StudySession";
import { UserTutor } from "./UserTutor";

@Entity()
export class Shift extends MyBaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @IsNotEmpty()
  @IsEnum(Weekday)
  @Column({ type: "enum", enum: Weekday, nullable: false })
  weekDay: Weekday;

  @IsNotEmpty()
  @Column({
    type: "time", nullable: false,
    transformer: {
      to(value) { return value; },
      from(value) {
        const date = new Date(0);
        const times = value.split(":").map((v: string) => parseInt(v));
        date.setHours(times[0]);
        date.setMinutes(times[1]);
        date.setSeconds(times[2]);
        return date;
      },
    },
  })
  startTime: Date;

  @IsNotEmpty()
  @Column({
    type: "time",
    nullable: false,
    transformer: {
      to(value) { return value; },
      from(value) {
        const date = new Date(0);
        const times = value.split(":").map((v: string) => parseInt(v));
        date.setHours(times[0]);
        date.setMinutes(times[1]);
        date.setSeconds(times[2]);
        return date;
      },
    },
  })
  endTime: Date;

  //Relation StudySession==N==<belong to>--N--Shift
  @ManyToMany(() => StudySession, (studySession) => studySession.shifts, { onDelete: "RESTRICT", onUpdate: "CASCADE" })
  studySessions: StudySession[];

  //Relation: Tutor--N--<Free In>--N--Shift
  @ManyToMany(() => UserTutor, (tutor) => tutor.shifts, { onDelete: "RESTRICT", onUpdate: "CASCADE" })
  tutors: UserTutor[];

}
