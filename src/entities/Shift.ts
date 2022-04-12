import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";
import { IsEnum, IsNotEmpty } from "class-validator";
import { Weekday } from "../utils/constants/weekday.constant";
import { MyBaseEntity } from "./MyBaseEntity";

@Entity()
export class Shift extends MyBaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @IsNotEmpty()
  @IsEnum(Weekday)
  @Column({ type: "enum", enum: Weekday, nullable: false })
  weekDay: Weekday;

  @IsNotEmpty()
  @Column({ type: "time", nullable: false })
  startTime: Date;

  @IsNotEmpty()
  @Column({ type: "time", nullable: false })
  endTime: Date;
}
