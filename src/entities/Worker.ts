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

  @ManyToOne(() => Branch, {onDelete: "RESTRICT", onUpdate: "CASCADE"})
  branch: Branch;
  
  @IsNotEmpty()
  @IsDate()
  @Column({type: "timestamp", nullable: false})
  startDate: Date;

  //hệ số lương
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  @Column()
  coefficients: number;

  //dân tộc
  @IsString()
  @Length(0, 20)
  @Column({ length: 20, nullable: true })
  nation: string;

  //cmnd | cccd | passport
  @IsString()
  @Length(0, 20)
  @Column({ length: 20, unique: true, nullable: false })
  passport: string;

  // nguyên quán
  @IsString()
  @Length(0, 20)
  @Column({ length: 20, nullable: true })
  domicile: string;

  @OneToMany(() => Salary, (salary) => salary.id, {})
  salary: Salary;
}
