import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  Index,
} from "typeorm";
import { IsNotEmpty, IsNumber, IsOptional, IsString, Length, Min } from "class-validator";
import { MyBaseEntity } from "./MyBaseEntity";
import { Curriculum } from "./Curriculum";

@Entity()
export class Lecture extends MyBaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @Column({ type: "int", nullable: false })
  order: number;

  @IsNotEmpty()
  @IsString()
  @Length(0, 255)
  @Column({ length: 255, nullable: false })
  name: string;

  //Description
  @IsOptional()
  @IsString()
  @Column({ type: "text", nullable: true })
  desc: string | null;

  @IsNotEmpty()
  @IsString()
  @Column({ type: "text", nullable: false })
  detail: string;

  @IsNotEmpty()
  @ManyToOne(() => Curriculum, {
    nullable: false,
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
  })
  curriculum: Curriculum;
}
