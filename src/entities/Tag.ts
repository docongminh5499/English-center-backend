import { Entity, ManyToMany, PrimaryColumn } from "typeorm";
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

  @ManyToMany(() => Question, (question) => question.tags, {onDelete: "CASCADE", onUpdate: "CASCADE"})
  questions: Question[];
}
