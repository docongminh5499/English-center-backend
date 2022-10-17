import { Entity, Column, PrimaryColumn, JoinColumn, ManyToOne } from "typeorm";
import { IsEnum, IsNotEmpty, IsNumber, IsPositive, IsString, Length } from "class-validator";
import { MyBaseEntity } from "./MyBaseEntity";
import { Branch } from "./Branch";
import { ClassroomFunction } from "../utils/constants/classroom.constant";

@Entity()
export class Classroom extends MyBaseEntity {
  @IsNotEmpty()
  @IsString()
  @Length(0, 100)
  @PrimaryColumn({ length: 100 })
  name: string;

  @IsNotEmpty()
  @ManyToOne(() => Branch, {
    nullable: false,
    onDelete: "RESTRICT",
    onUpdate: "CASCADE",
  })
  @JoinColumn()
  @PrimaryColumn({ type: "int", name: "branchId" })
  branch: Branch;

  @IsNotEmpty()
  @IsEnum(ClassroomFunction)
  @Column({ type: "enum", enum: ClassroomFunction, nullable: false })
  function: ClassroomFunction;

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  @Column({ type: "integer", nullable: false })
  capacity: number;
}
