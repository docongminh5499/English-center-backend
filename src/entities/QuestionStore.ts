import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable, OneToMany } from "typeorm";
import { IsNotEmpty, IsOptional, IsString, Length } from "class-validator";
import { MyBaseEntity } from "./MyBaseEntity";
import { Tag } from "./Tag";
import { WrongAnswerStore } from "./WrongAnswerStore";
import { CurriculumExercise } from "./CurriculumExercise";

@Entity()
export class QuestionStore extends MyBaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @IsNotEmpty()
  @IsString()
  @Column({ type: "text", nullable: false })
  quesContent: string;

  @IsString()
  @Column({ type: "text", nullable: true, default: null })
  temporaryKey: string | null;

  @IsNotEmpty()
  @IsString()
  @Length(0, 255)
  @Column({ length: 255, nullable: false })
  answer: string;

  @IsOptional()
  @IsString()
  @Length(0, 255)
  @Column({type:'varchar', length: 255, nullable: true })
  imgSrc: string | null;

  @IsOptional()
  @IsString()
  @Length(0, 255)
  @Column({type:'varchar', length: 255, nullable: true })
  audioSrc: string | null;

  @OneToMany(() => WrongAnswerStore, (wrongAnswerStore) => wrongAnswerStore.questionStore)
  wrongAnswers: WrongAnswerStore[];

  @ManyToMany(() => Tag, {onDelete: "CASCADE", onUpdate: "CASCADE"})
  @JoinTable({ name: "question_store_belong_tag" })
  tags: Tag[];

  @ManyToMany(() => CurriculumExercise, (exercise) => exercise.questions, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  curriculumExercises: CurriculumExercise[];
}
