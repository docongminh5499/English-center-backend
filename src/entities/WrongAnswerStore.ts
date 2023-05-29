import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  JoinColumn,
  ManyToOne,
} from "typeorm";
import { IsNotEmpty, IsString, Length } from "class-validator";
import { MyBaseEntity } from "./MyBaseEntity";
import { QuestionStore } from "./QuestionStore";

@Entity()
export class WrongAnswerStore extends MyBaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @IsNotEmpty()
  @IsString()
  @Length(0, 255)
  @Column({ length: 255, nullable: false })
  answer: string;

  @IsNotEmpty()
  @ManyToOne(
    () => QuestionStore,
    (questionStore) => questionStore.wrongAnswers,
    {
      nullable: false,
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    }
  )
  @JoinColumn()
  questionStore: QuestionStore;
}
