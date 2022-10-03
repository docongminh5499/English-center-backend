import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from "typeorm";
import { IsBoolean, IsDate, IsNumber, IsString, Max, Min } from "class-validator";
import { MyBaseEntity } from "./MyBaseEntity";
import { Course } from "./Course";
import { UserStudent } from "./UserStudent";

//Relation Student--N--Participate--N--Course
@Entity()
export class StudentParticipateCourse extends MyBaseEntity {
  
  @PrimaryColumn({type: "int", name:"studentId" })
  @ManyToOne(() => UserStudent, {onDelete: "CASCADE", onUpdate: "CASCADE"})
  @JoinColumn({name:"studentId"})
  student: UserStudent;

  @PrimaryColumn({type: "int", name:"courseId"})
  @ManyToOne(() => Course, {onDelete: "RESTRICT", onUpdate: "CASCADE"})
  @JoinColumn({name:"courseId"})
  course: Course;

  @IsDate()
  @Column({type: "timestamp", precision: 6})
  billingDate: Date;

  @IsString()
  @Column({ type: "text"})
  comment: string;
  
  @IsNumber()
  @Min(1)
  @Max(5)
  @Column({ type: "integer"})
  starPoint: number;

  @IsBoolean()
  @Column({ type: "boolean"})
  isIncognito: boolean;
}