import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable } from "typeorm";
import { IsNotEmpty, IsString, Length } from "class-validator";
import { MyBaseEntity } from "./MyBaseEntity";
import { Tag } from "./Tag";

@Entity()
export class Question extends MyBaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @IsNotEmpty()
  @IsString()
  @Column({ type: "text", nullable: false })
  quesContent: string;

  @IsNotEmpty()
  @IsString()
  @Length(0, 255)
  @Column({ length: 255, nullable: false })
  answer: string;

  @IsString()
  @Length(0, 255)
  @Column({ length: 255, nullable: true })
  imgSrc: string;

  @IsString()
  @Length(0, 255)
  @Column({ length: 255, nullable: true })
  audioSrc: string;

  @ManyToMany(() => Tag)
  @JoinTable({ name: "question_belong_tag" })
  tags: Tag[];
}
