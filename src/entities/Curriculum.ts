import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToMany,
  JoinTable,
} from "typeorm";
import { IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsString, Length, Min } from "class-validator";
import { MyBaseEntity } from "./MyBaseEntity";
import { Lecture } from "./Lecture";
import { TermCourse } from "../utils/constants/termCuorse.constant";
import { Tag } from "./Tag";
import { CurriculumLevel } from "../utils/constants/curriculum.constant";

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
  @Column({ type: "boolean", nullable: false })
  latest: boolean;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @Column({ type: "int", nullable: false })
  shiftsPerSession: number;

  @OneToMany(() => Lecture, (lecture) => lecture.curriculum)
  lectures: Lecture[];

  @ManyToMany(() => Tag, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinTable({ name: "curriculum_belong_tag" })
  tags: Tag[];


  @IsNotEmpty()
  @IsEnum(CurriculumLevel)
  @Column({ type: "enum", enum: CurriculumLevel, nullable: false })
  level: CurriculumLevel;
}
