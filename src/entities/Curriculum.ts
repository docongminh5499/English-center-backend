import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
} from "typeorm";
import { IsBoolean, IsEnum, IsNotEmpty, IsString, Length } from "class-validator";
import { MyBaseEntity } from "./MyBaseEntity";
import { Lecture } from "./Lecture";
import { TermCourse } from "../utils/constants/termCuorse.constant";

@Entity()
export class Curriculum extends MyBaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @IsNotEmpty()
  @IsString()
  @Length(0, 255)
  @Column({ length: 255, nullable: false })
  name: string;

  //Description
  @IsNotEmpty()
  @IsString()
  @Column({ type: "text", nullable: false })
  desc: string;

  @IsNotEmpty()
  @IsString()
  @Length(0, 255)
  @Column({ length: 255, nullable: false })
  image: string;

  @IsNotEmpty()
  @IsEnum(TermCourse)
  @Column({
    type: "enum",
    enum: TermCourse,
    nullable: false,
    default: TermCourse.ShortTerm,
  })
  type: TermCourse;

  @IsNotEmpty()
  @IsBoolean()
  @Column({type: "boolean", nullable: false})
  latest: boolean;


  @OneToMany(() => Lecture, (lecture) => lecture.curriculum)
  lectures: Lecture[];
}
