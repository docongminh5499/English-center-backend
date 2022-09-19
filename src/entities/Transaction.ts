import { Entity, ManyToOne, Column, PrimaryColumn } from "typeorm";
import {
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  Length,
  IsEnum,
} from "class-validator";
import { Branch } from "./Branch";
import { MyBaseEntity } from "./MyBaseEntity";
import { TransactionType } from "../utils/constants/transaction.constant";

@Entity()
export class Transaction extends MyBaseEntity {
  @IsString()
  @Length(0, 50)
  @PrimaryColumn()
  transCode: string;

  @IsNotEmpty()
  @IsString()
  @Length(0, 255)
  @Column({ length: 255, nullable: false })
  content: string;

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  @Column({ type: "decimal", precision: 9, scale: 0, nullable: false })
  amount: number;

  @IsNotEmpty()
  @IsEnum(TransactionType)
  @Column({ type: "enum", enum: TransactionType, nullable: false })
  type: TransactionType; 

  @ManyToOne(() => Branch, {onDelete: "CASCADE", onUpdate: "CASCADE", nullable: false})
  branch: Branch;
}
