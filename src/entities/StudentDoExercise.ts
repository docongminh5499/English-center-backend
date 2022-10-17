import { Entity, Column, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { IsDate, IsNotEmpty, IsNumber, Min } from "class-validator";
import { MyBaseEntity } from "./MyBaseEntity";
import { UserStudent } from "./UserStudent";
import { Exercise } from "./Exercise";

@Entity()
export class StudentDoExercise extends MyBaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => UserStudent, {
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: 'studentId' })
  student: UserStudent;

  @ManyToOne(() => Exercise, {
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: 'exerciseId' })
  exercise: Exercise;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Column({
    type: "decimal",
    precision: 3,
    scale: 1,
    nullable: false,
    transformer: {
      to(value) { return value; },
      from(value) { return parseFloat(value); },
    },
  })
  score: number;

  @IsNotEmpty()
  @IsDate()
  @Column({ type: "timestamp", precision: 6, nullable: false })
  startTime: Date;

  @IsNotEmpty()
  @IsDate()
  @Column({ type: "timestamp", precision: 6, nullable: false })
  endTime: Date;
}
