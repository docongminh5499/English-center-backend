import { Entity, OneToMany, PrimaryGeneratedColumn, Column } from "typeorm";
import { User } from "./UserEntity";
import { UserTeacher } from "./UserTeacher";
import { UserTutor } from "./UserTutor";
import { Salary } from "./Salary";
import { UserRole } from "../utils/constants/role.constant";
import {
    IsNotEmpty,
    IsNumber,
    IsPositive,
    IsString,
    Length
} from "class-validator";

@Entity()
export class UserEmployee extends User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    roles: UserRole.EMPLOYEE;

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
    @IsNumber()
    @Length(0, 20)
    @Column({ length: 20, unique: true, nullable: false })
    passport: number;

    // nguyên quán
    @IsString()
    @Length(0, 20)
    @Column({ length: 20, nullable: true })
    domicile: string;
    @OneToMany(() => UserTeacher, userTeacher => userTeacher.id)
    userTeacher: UserTeacher[];

    @OneToMany(() => UserTutor, userTutor => userTutor.id)
    userTutor: UserTutor[];

    @OneToMany(() => Salary, salary => salary.id)
    salary: Salary;
}