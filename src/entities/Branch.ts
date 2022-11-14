import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, OneToMany } from "typeorm";
import { IsNotEmpty, IsString, Length } from "class-validator";
import { MyBaseEntity } from "./MyBaseEntity";
import { UserEmployee } from "./UserEmployee";
import { Worker } from "./Worker";
import { UserTeacher } from "./UserTeacher";

@Entity()
export class Branch extends MyBaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @IsNotEmpty()
  @IsString()
  @Length(0, 10)
  @Column({ length: 10, nullable: false })
  phoneNumber: string;

  @IsNotEmpty()
  @IsString()
  @Length(0, 255)
  @Column({ length: 255, nullable: false })
  address: string;

  @IsNotEmpty()
  @IsString()
  @Length(0, 255)
  @Column({ length: 255, nullable: false })
  name: string;

  @OneToOne(() => UserEmployee, {onDelete: "SET NULL", onUpdate: "CASCADE"})
  @JoinColumn({name: "employeeId"})
  userEmployee: UserEmployee;

  @OneToOne(() => UserTeacher, {onDelete: "SET NULL", onUpdate: "CASCADE"})
  @JoinColumn({name: "teacherId"})
  userTeacher: UserTeacher;
  
  @OneToMany(() => Worker, (worker) => worker.branch)
  workers: Worker[];
}