import { Entity, Column, PrimaryColumn, JoinColumn, ManyToOne } from "typeorm";
import { IsDate, IsNotEmpty, IsNumber, Min } from "class-validator";
import { MyBaseEntity } from "./MyBaseEntity";
import { UserStudent } from "./UserStudent";
import { Exercise } from "./Exercise";

@Entity()
export class StudentDoExercise extends MyBaseEntity {
  @PrimaryColumn({ type: "int", name: 'studentId' })
  @ManyToOne(() => UserStudent, {
    onUpdate: "CASCADE",
    onDelete: "RESTRICT",
  })
  @JoinColumn()
  student: UserStudent;

  @PrimaryColumn({ type: "int", name: 'exerciseId' })
  @ManyToOne(() => Exercise, {
    onUpdate: "CASCADE",
    onDelete: "RESTRICT",
  })
  @JoinColumn()
  exercise: Exercise;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Column({ type: "decimal", precision: 3, scale: 1, nullable: false })
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
