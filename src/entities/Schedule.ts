import { Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { IsNotEmpty } from "class-validator";
import { Classroom } from "./Classroom";
import { Course } from "./Course";
import { MyBaseEntity } from "./MyBaseEntity";
import { Shift } from "./Shift";
import { UserTutor } from "./UserTutor";

@Entity()
export class Schedule extends MyBaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @IsNotEmpty()
  @ManyToOne(() => Course, {
    nullable: false,
    onUpdate: "CASCADE",
    onDelete: "RESTRICT",
  })
  @JoinColumn()
  course: Course;

  @IsNotEmpty()
  @ManyToOne(() => UserTutor, {
    nullable: false,
    onUpdate: "CASCADE",
    onDelete: "RESTRICT",
  })
  @JoinColumn()
  tutor: UserTutor;

  @IsNotEmpty()
  @ManyToOne(() => Shift, {
    nullable: false,
    onUpdate: "CASCADE",
    onDelete: "RESTRICT",
  })
  @JoinColumn()
  startShift: Shift;

  @IsNotEmpty()
  @ManyToOne(() => Shift, {
    nullable: false,
    onUpdate: "CASCADE",
    onDelete: "RESTRICT",
  })
  @JoinColumn()
  endShift: Shift;

  @IsNotEmpty()
  @ManyToOne(() => Classroom, {
    nullable: false,
    onUpdate: "CASCADE",
    onDelete: "RESTRICT",
  })
  @JoinColumn([
    { name: "classroomName", referencedColumnName: "name" },
    { name: "branchId", referencedColumnName: "branch" },
  ])
  classroom: Classroom;
}
