import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryColumn,
} from "typeorm";
import { MyBaseEntity } from "./MyBaseEntity";
import { User } from "./UserEntity";
import {
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  Length,
} from "class-validator";
import { Branch } from "./Branch";

@Entity()
export class Worker extends MyBaseEntity {
  @PrimaryColumn({ type: "int", name: "workerId" })
  @OneToOne(() => User, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn({ name: "workerId" })
  user: User;

  // nguyên quán
  @IsNotEmpty()
  @IsString()
  @Length(0, 255)
  @Column({ length: 255, nullable: false })
  homeTown: string;

  //cmnd | cccd | passport
  @IsNotEmpty()
  @IsString()
  @Length(0, 12)
  @Column({ length: 12, unique: true, nullable: false })
  passport: string;

  //dân tộc
  @IsNotEmpty()
  @IsString()
  @Length(0, 100)
  @Column({ length: 100, nullable: false })
  nation: string;

  //hệ số lương
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  @Column({ type: "decimal", precision: 4, scale: 2, nullable: false })
  coefficients: number;

  //Ngày mới nhất tính lương
  @IsDate()
  @Column({ type: "timestamp", nullable: true })
  salaryDate: Date;

  @IsNotEmpty()
  @IsDate()
  @Column({ type: "timestamp", nullable: false })
  startDate: Date;


  @ManyToOne(() => Branch, (branch) => branch.workers, {
    nullable: true,
    onDelete: "RESTRICT",
    onUpdate: "CASCADE",
  })
  branch: Branch;
}
