import { Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
// import { Classroom } from "./Classroom";
import { Course } from "./Course";
import { MyBaseEntity } from "./MyBaseEntity";
import { Shift } from "./Shift";
import { UserTutor } from "./UserTutor";

@Entity()
export class Schedule extends MyBaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Course, {
    nullable: false,
    onUpdate: "CASCADE",
    onDelete: "RESTRICT",
  })
  @JoinColumn()
  course: Course;

  @ManyToOne(() => UserTutor, {
    nullable: false,
    onUpdate: "CASCADE",
    onDelete: "RESTRICT",
  })
  @JoinColumn()
  tutor: UserTutor;

  @ManyToOne(() => Shift, {
    nullable: false,
    onUpdate: "CASCADE",
    onDelete: "RESTRICT",
  })
  @JoinColumn()
  startShift: Shift;

  @ManyToOne(() => Shift, {
    nullable: false,
    onUpdate: "CASCADE",
    onDelete: "RESTRICT",
  })
  @JoinColumn()
  endShift: Shift;

  // @ManyToOne(() => Classroom)
  // @JoinColumn([
  //   {name: "room", referencedColumnName: "name"},
  //   {name: "branch", referencedColumnName: "branchId"}
  // ])
  // classroom: Classroom;
}
