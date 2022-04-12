import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from "typeorm";
import {
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  Length,
} from "class-validator";
import { MyBaseEntity } from "./MyBaseEntity";
import { Money } from "./Money";

@Entity()
export class Fee extends MyBaseEntity {
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

  @IsNotEmpty()
  @IsDate()
  @Column({ type: "timestamp", nullable: false })
  dueDate: Date;

  @OneToOne(() => Money, {
    nullable: false,
    onUpdate: "CASCADE",
    onDelete: "RESTRICT",
  })
  @JoinColumn()
  money: Money;
}
