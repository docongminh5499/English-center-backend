import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  ManyToOne,
} from "typeorm";
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  Length,
} from "class-validator";
import { MyBaseEntity } from "./MyBaseEntity";
import { Money } from "./Money";
import { Branch } from "./Branch";

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

  @IsBoolean()
  @Column({ type: "bool", default: false })
  paid: boolean;

  @OneToOne(() => Money, {
    nullable: false,
    onUpdate: "CASCADE",
    onDelete: "RESTRICT",
  })
  @JoinColumn()
  money: Money;

  @ManyToOne(() => Branch, (branch) => branch.id)
  @JoinColumn()
  branch: Branch;
}
