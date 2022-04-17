import { Entity, Column, OneToOne, PrimaryColumn, JoinColumn } from "typeorm";
import { IsDate, IsNotEmpty, IsNumber, Min } from "class-validator";
import { MyBaseEntity } from "./MyBaseEntity";
import { UserStudent } from "./UserStudent";
import { Exercise } from "./Exercise";

@Entity()
export class StudentDoExercise extends MyBaseEntity {
  @PrimaryColumn({ type: "int", name: 'studentId' })
  @OneToOne(() => UserStudent, {
    onUpdate: "CASCADE",
    onDelete: "RESTRICT",
  })
  @JoinColumn()
  student: UserStudent;

  @PrimaryColumn({ type: "int", name: 'exerciseId' })
  @OneToOne(() => Exercise, {
    onUpdate: "CASCADE",
    onDelete: "RESTRICT",
  })
  @JoinColumn()
  exercise: Exercise;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Column({ type: "integer", nullable: false })
  score: number;

  @IsDate()
  @Column({ type: "timestamp", nullable: false })
  startTime: Date;

  @IsDate()
  @Column({ type: "timestamp", nullable: false })
  endTime: Date;
}
