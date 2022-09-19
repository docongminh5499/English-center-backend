import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
} from "typeorm";
import { IsNotEmpty, IsString, Length } from "class-validator";
import { MyBaseEntity } from "./MyBaseEntity";
import { Lecture } from "./Lecture";

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

  @OneToMany(() => Lecture, (lecture) => lecture.curriculum)
  lectures: Lecture[];
}
