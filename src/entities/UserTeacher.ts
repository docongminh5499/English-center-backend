import { Entity, JoinColumn, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Course } from "./Course";
import { Worker } from "./Worker";

@Entity()
export class UserTeacher extends Worker {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToMany(() => Course, (course) => course.teacher)
  @JoinColumn()
  courses: Course[];
}
