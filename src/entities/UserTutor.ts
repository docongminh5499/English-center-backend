import { Entity, OneToMany, PrimaryGeneratedColumn, Column } from "typeorm";
import { User } from "./UserEntity";
import { UserRole } from "../utils/constants/role.constant";
import { Salary } from "./Salary";
import {
    IsNotEmpty,
    IsNumber,
    IsPositive,
    IsString,
    Length
} from "class-validator";

@Entity()
export class UserTutor extends User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    roles: UserRole.TUTOR;

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

    @IsNotEmpty()
    @IsString()
    @Length(0, 20)
    @Column({ length: 20, unique: true, nullable: false })
    passport: string;

    // nguyên quán
    @IsString()
    @Length(0, 20)
    @Column({ length: 20, nullable: true })
    domicile: string;

    @OneToMany(() => Salary, salary => salary.id)
    salary: Salary;
}