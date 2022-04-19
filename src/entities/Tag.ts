import { Entity, JoinTable, ManyToMany, PrimaryColumn } from "typeorm";
import { IsNotEmpty, IsString, Length } from "class-validator";
import { MyBaseEntity } from "./MyBaseEntity";
import { Question } from "./Question";

@Entity()
export class Tag extends MyBaseEntity {
  @IsNotEmpty()
  @IsString()
  @Length(0, 100)
  @PrimaryColumn({ length: 100 })
  name: string;

  @ManyToMany(() => Question, {onDelete: "RESTRICT", onUpdate: "CASCADE"})
  @JoinTable({ name: "question_belong_tag" })
  questions: Question[];
}
