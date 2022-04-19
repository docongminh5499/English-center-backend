import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  ManyToOne,
} from "typeorm";
import {
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  Length,
} from "class-validator";
import { MyBaseEntity } from "./MyBaseEntity";
import { Money } from "./Money";
import { Worker } from "./Worker";

@Entity()
export class Salary extends MyBaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

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

  @IsString()
  @Length(0, 50)
  @Column({ length: 50, nullable: true })
  transCode: string;

  @OneToOne(() => Money, {
    nullable: false,
    onUpdate: "CASCADE",
    onDelete: "RESTRICT",
  })
  @JoinColumn()
  money: Money;

  @ManyToOne(() => Worker, {onDelete: "RESTRICT", onUpdate: "CASCADE", nullable: false})
  @JoinColumn({name: "workerId"})
  worker: Worker;
}
