import { Entity, PrimaryGeneratedColumn, Column, OneToOne } from "typeorm";
import { IsNotEmpty,IsEnum, IsString, Length, Min, Max, IsNumber } from "class-validator";
import { UserRole } from "../utils/constants/role.constant";
import { MyBaseEntity } from "./MyBaseEntity";
import {Account} from "./Account"
import { Sex } from "../utils/constants/sex.constant";

@Entity()
export class User extends MyBaseEntity{
    @PrimaryGeneratedColumn()
    id: number

    @IsNotEmpty()
    @IsString()
    @Column({ length: 50, unique: true, nullable: false })
    email: string

    @IsString()
    @Length(0, 255)
    @Column()
    userName: string

    @IsNumber()
    @Length(0, 10)
    @Column({ length: 10, nullable: false })
    phone: string
    
    @IsNumber()
    @Column()
    @Min(1)
    @Max(99)
    age: number
    
    @IsEnum(Sex)
    @Column({ type: "enum", enum: Sex, nullable: false })
    sex: Sex;

    @IsString()
    @Length(0, 255)
    @Column({ length: 255, nullable: true })
    address: string

    @IsNotEmpty()
    @IsEnum(UserRole)
    @Column({ type: "enum", enum: UserRole, nullable: false })
    roles: UserRole;

    @OneToOne(type => Account, account => account.id)
    @Column()
    account: Account

    }