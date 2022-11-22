import { Entity, ManyToOne, Column, PrimaryColumn, JoinColumn, Index } from "typeorm";
import {
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  Length,
  IsEnum,
  IsDate,
} from "class-validator";
import { Branch } from "./Branch";
import { MyBaseEntity } from "./MyBaseEntity";
import { TransactionType } from "../utils/constants/transaction.constant";
import { UserEmployee } from "./UserEmployee";

@Entity()
export class Transaction extends MyBaseEntity {
  @IsString()
  @Length(0, 50)
  @PrimaryColumn({ type: 'varchar', length: 50, nullable: false })
  transCode: string;

  
  @IsNotEmpty()
  @IsString()
  @Length(0, 255)
  @Column({ length: 255, nullable: false })
  content: string;


  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  @Column({
    type: "decimal",
    precision: 9,
    scale: 0,
    nullable: false,
    transformer: {
      to(value) { return value; },
      from(value) { return parseFloat(value); },
    },
  })
  amount: number;


  @Index()
  @IsNotEmpty()
  @IsEnum(TransactionType)
  @Column({ type: "enum", enum: TransactionType, nullable: false })
  type: TransactionType;

  
  @Index()
  @IsNotEmpty()
  @IsDate()
  @Column({ type: "timestamp", precision: 6, nullable: false })
  payDate: Date;


  @ManyToOne(() => UserEmployee, {
    onUpdate: "CASCADE",
    onDelete: "RESTRICT",
  })
  @JoinColumn({ name: "employeeId" })
  userEmployee: UserEmployee;


  @ManyToOne(() => Branch, { onDelete: "CASCADE", onUpdate: "CASCADE", nullable: false })
  branch: Branch;
}
