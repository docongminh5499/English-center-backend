import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, OneToMany } from "typeorm";
import { IsNotEmpty, IsString, Length } from "class-validator";
import { MyBaseEntity } from "./MyBaseEntity";
import { UserEmployee } from "./UserEmployee";
import { Worker } from "./Worker";

@Entity()
export class Branch extends MyBaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @IsNotEmpty()
  @IsString()
  @Length(0, 11)
  @Column({ length: 11, nullable: false })
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
  
  @OneToMany(() => Worker, (worker) => worker.branch)
  workers: Worker[];
}