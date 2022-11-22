import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from "typeorm";
import { IsBoolean, IsDate, IsNumber, IsOptional, IsString, Max, Min } from "class-validator";
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
  @Column({ type: "timestamp", precision: 6, nullable: false })
  billingDate: Date;

  @IsOptional()
  @IsString()
  @Column({ type: "text", nullable: true })
  comment: string | null;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  @Column({ type: "integer", nullable: true })
  starPoint: number | null;

  @IsOptional()
  @IsBoolean()
  @Column({ type: "boolean", nullable: true })
  isIncognito: boolean | null;

  @IsOptional()
  @IsDate()
  @Column({ type: "timestamp", precision: 6, nullable: true })
  commentDate: Date | null;
}