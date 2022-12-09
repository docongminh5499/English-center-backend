import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, Index } from "typeorm";
import { IsEnum, IsNotEmpty } from "class-validator";
import { Weekday } from "../utils/constants/weekday.constant";
import { MyBaseEntity } from "./MyBaseEntity";
import { StudySession } from "./StudySession";
import { UserTutor } from "./UserTutor";

@Entity()
@Index(["weekDay", "startTime"])
export class Shift extends MyBaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @IsNotEmpty()
  @IsEnum(Weekday)
  @Column({ type: "enum", enum: Weekday, nullable: false })
  weekDay: Weekday;

  @Index()
  @IsNotEmpty()
  @Column({
    type: "time", nullable: false,
    transformer: {
      to(value) { return value; },
      from(value) {
        const date = new Date();
        const times = value.split(":").map((v: string) => parseInt(v));
        date.setHours(times[0]);
        date.setMinutes(times[1]);
        date.setSeconds(times[2]);
        return date;
      },
    },
  })
  startTime: Date;

  @Index()
  @IsNotEmpty()
  @Column({
    type: "time",
    nullable: false,
    transformer: {
      to(value) { return value; },
      from(value) {
        const date = new Date();
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
  @ManyToMany(() => StudySession, (studySession) => studySession.shifts, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  studySessions: StudySession[];

  //Relation: Tutor--N--<Free In>--N--Shift
  @ManyToMany(() => UserTutor, (tutor) => tutor.shifts, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  tutors: UserTutor[];

}
