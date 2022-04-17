import { Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
// import { Classroom } from "./Classroom";
import { Course } from "./Course";
import { MyBaseEntity } from "./MyBaseEntity";
import { Shift } from "./Shift";
import { UserTutor } from "./UserTutor";

@Entity()
export class Schedule extends MyBaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => Course, {
    nullable: false,
    onUpdate: "CASCADE",
    onDelete: "RESTRICT",
  })
  @JoinColumn()
  course: Course;

  @OneToOne(() => UserTutor, {
    nullable: false,
    onUpdate: "CASCADE",
    onDelete: "RESTRICT",
  })
  @JoinColumn()
  tutor: UserTutor;

  @OneToOne(() => Shift, {
    nullable: false,
    onUpdate: "CASCADE",
    onDelete: "RESTRICT",
  })
  @JoinColumn()
  startShift: Shift;

  @OneToOne(() => Shift, {
    nullable: false,
    onUpdate: "CASCADE",
    onDelete: "RESTRICT",
  })
  @JoinColumn()
  endShift: Shift;

  // @OneToOne(() => Classroom)
  // @JoinColumn([
  //   {name: "room", referencedColumnName: "name"},
  //   {name: "brand", referencedColumnName: "brandId"}
  // ])
  // classroom: Classroom;
}
