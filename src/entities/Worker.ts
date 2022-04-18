import { Entity, OneToMany, Column, OneToOne } from "typeorm";
import { User } from "./UserEntity";
import { Salary } from "./Salary";
import {
    IsNotEmpty,
    IsNumber,
    IsPositive,
    IsString,
    Length
} from "class-validator";
import { Branch } from "./Branch";


@Entity()
export class Worker {

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

    @OneToMany(() => Salary, salary => salary.id,{})
    salary: Salary;

    @OneToOne(() => Branch, branch => branch.id)
    branch: Branch;

    @OneToOne(() => User, user => user.id)
    user: User;
}