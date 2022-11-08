import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from "typeorm";
import { IsBoolean, IsDate, IsNumber, IsString, Max, Min } from "class-validator";
import { MyBaseEntity } from "./MyBaseEntity";
import { Course } from "./Course";
import { UserStudent } from "./UserStudent";

//Relation Student--N--Participate--N--Course
@Entity()
export class StudentParticipateCourse extends MyBaseEntity {

  @PrimaryColumn({ type: "int", name: "studentId" })
  @ManyToOne(() => UserStudent, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn({ name: "studentId" })
  student: UserStudent;

  @PrimaryColumn({ type: "int", name: "courseId" })
  @ManyToOne(() => Course, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn({ name: "courseId" })
  course: Course;

  @IsDate()
  @Column({ type: "timestamp", precision: 6, nullable: true })
  billingDate: Date | null;

  @IsString()
  @Column({ type: "text", nullable: true })
  comment: string | null;

  @IsNumber()
  @Min(1)
  @Max(5)
  @Column({ type: "integer", nullable: true })
  starPoint: number | null;

  @IsBoolean()
  @Column({ type: "boolean", nullable: true })
  isIncognito: boolean | null;

  @IsDate()
  @Column({ type: "timestamp", precision: 6, nullable: true })
  commentDate: Date | null;
}