import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";
import { IsDate, IsEnum, IsNotEmpty, IsNumber } from "class-validator";
import { MyBaseEntity } from "./MyBaseEntity";
import { ExerciseStatus } from "../utils/constants/exercise.constant";

@Entity()
export class Exercise extends MyBaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @IsDate()
  @Column({ type: "timestamp", nullable: true })
  openTime: Date;

  @IsDate()
  @Column({ type: "timestamp", nullable: true })
  endTime: Date;

  @IsNotEmpty()
  @IsEnum(ExerciseStatus)
  @Column({ type: "enum", enum: ExerciseStatus, nullable: false })
  status: ExerciseStatus;

  @IsNumber()
  @Column({ type: "integer", default: 3 })
  maxTime: number;
}
