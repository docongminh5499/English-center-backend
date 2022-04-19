import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryColumn } from "typeorm";
import { MyBaseEntity } from "./MyBaseEntity";
import { User } from "./UserEntity";
import { Salary } from "./Salary";
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

  @PrimaryColumn({type: "int", name: "workerId"})
  @OneToOne(() => User, {onDelete: "CASCADE", onUpdate: "CASCADE"})
  @JoinColumn({name: "workerId"})
  user: User;

  @ManyToOne(() => Branch, (branch) => branch.workers, {onDelete: "RESTRICT", onUpdate: "CASCADE"})
  branch: Branch;
  
  @IsNotEmpty()
  @IsDate()
  @Column({type: "timestamp", nullable: false})
  startDate: Date;

  //hệ số lương
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  @Column({type: "decimal"})
  coefficients: number;

  //dân tộc
  @IsNotEmpty()
  @IsString()
  @Length(0, 20)
  @Column({length: 20, nullable: true })
  nation: string;

  //cmnd | cccd | passport
  @IsNotEmpty()
  @IsString()
  @Length(0, 20)
  @Column({ length: 20, unique: true, nullable: false })
  passport: string;

  // nguyên quán
  @IsString()
  @Length(0, 20)
  @Column({ length: 20, nullable: true })
  homeTown: string;
  
  //Ngày mới nhất tính lương
  @IsDate()
  @Column({type: "timestamp", nullable: true})
  salaryDate: Date;
  
  @OneToMany(() => Salary, (salary) => salary.id)
  salary: Salary;
}
