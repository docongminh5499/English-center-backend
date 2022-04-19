import { Entity, Column, PrimaryColumn, JoinColumn, ManyToOne } from "typeorm";
import { IsNotEmpty, IsNumber, IsPositive, IsString, Length } from "class-validator";
import { MyBaseEntity } from "./MyBaseEntity";
import { Branch } from "./Branch";

@Entity()
export class Classroom extends MyBaseEntity {
  @IsString()
  @Length(0, 100)
  @PrimaryColumn({ length: 100 })
  name: string;

  @ManyToOne(() => Branch, {
    nullable: false,
    onDelete: "RESTRICT",
    onUpdate: "CASCADE",
  })
  @JoinColumn()
  @PrimaryColumn({ type: "int", name: "branchId" })
  branch: Branch;

  @IsNotEmpty()
  @IsString()
  @Length(0, 255)
  @Column({ length: 255, nullable: false })
  function: string;

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  @Column({ type: "integer", nullable: false })
  capacity: number;
}
