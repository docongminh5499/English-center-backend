import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from "typeorm";
import { IsBoolean, IsDate, IsNotEmpty, IsString } from "class-validator";
import { MyBaseEntity } from "./MyBaseEntity";
import { Course } from "./Course";
import { UserStudent } from "./UserStudent";

//Relation Student--N--Participate--N--Course
@Entity()
export class StudentParticipateCourse extends MyBaseEntity {

  
  @PrimaryColumn({type: "int", name:"studentId"})
  @ManyToOne(() => UserStudent)
  @JoinColumn()
  student: UserStudent;

  @PrimaryColumn({type: "int", name:"courseId"})
  @ManyToOne(() => Course)
  @JoinColumn()
  course: Course;

  @IsDate()
  @Column({type: "date"})
  billingDate: Date;

  @IsNotEmpty()
  @IsString()
  @Column({ type: "text"})
  comment: string;
  
  @IsNotEmpty()
  @IsString()
  @Column({ type: "integer"})
  starPoint: number;

  @IsNotEmpty()
  @IsBoolean()
  @Column({ type: "boolean"})
  isIncognito: boolean;
}