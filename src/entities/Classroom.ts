import { Entity, Column, PrimaryGeneratedColumn, PrimaryColumn } from "typeorm";
import { IsNotEmpty, IsNumber, IsPositive, IsString, Length } from "class-validator";
import { MyBaseEntity } from "./MyBaseEntity";

@Entity()
export class Classroom extends MyBaseEntity {
  
  @IsString()
  @Length(0, 100)
  @PrimaryColumn({length: 100})
  name: string;

  @IsNotEmpty()
  @IsString()
  @Length(0, 100)
  @Column({ length: 100, nullable: false })
  function: string;

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  @Column({nullable: false })
  capacity: number;
}