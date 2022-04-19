import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import {
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  Length,
} from "class-validator";
import { MyBaseEntity } from "./MyBaseEntity";
import { Course } from "./Course";

@Entity()
export class Document extends MyBaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @IsNotEmpty()
  @IsString()
  @Length(0, 255)
  @Column({ length: 255, nullable: false })
  name: string;

  @IsString()
  @Length(0, 255)
  @Column({ length: 255, nullable: true })
  author: string;

  @IsNumber()
  @IsPositive()
  @Column({ type: "integer", nullable: true })
  pubYear: number;

  @IsString()
  @Length(0, 255)
  @Column({ length: 255, nullable: true })
  src: string;

  //Relation Cuorse--1--<has>==N==Document
  @ManyToOne(() => Course, (course) => course.documents,{onDelete: "CASCADE", onUpdate:"CASCADE"})
  course: Course;
}
