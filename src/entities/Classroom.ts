import { Entity, Column, PrimaryColumn, OneToOne } from "typeorm";
import { IsNotEmpty, IsNumber, IsPositive, IsString, Length } from "class-validator";
import { MyBaseEntity } from "./MyBaseEntity";
import { Branch } from "./Branch";

@Entity()
export class Classroom extends MyBaseEntity {
  
  @IsString()
  @Length(0, 100)
  @PrimaryColumn({length: 100})
  name: string;
  
  @OneToOne(() => Branch)
  @PrimaryColumn({type: "int", name: "branchId"})
  branch: Branch;

  @IsNotEmpty()
  @IsString()
  @Length(0, 100)
  @Column({ length: 100, nullable: false })
  function: string;

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  @Column({type: "integer", nullable: false })
  capacity: number;
}