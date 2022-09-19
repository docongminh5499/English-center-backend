import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";
import { IsNotEmpty,IsEnum, IsString, Length, IsDate } from "class-validator";
import { UserRole } from "../utils/constants/role.constant";
import { MyBaseEntity } from "./MyBaseEntity";
import { Sex } from "../utils/constants/sex.constant";

@Entity()
export class User extends MyBaseEntity{
    @PrimaryGeneratedColumn()
    id: number;

    @IsString()
    @Column({ length: 50, unique: true, nullable: true })
    email: string;

    @IsNotEmpty()
    @IsString()
    @Length(0, 50)
    @Column({ length: 50, nullable: false })
    fullName: string;

    @IsString()
    @Length(0, 11)
    @Column({ length: 11, nullable: true })
    phone: string
    
    @IsNotEmpty()
    @IsDate()
    @Column({type: "timestamp", nullable: false})
    dateOfBirth: Date
    
    @IsNotEmpty()
    @IsEnum(Sex)
    @Column({ type: "enum", enum: Sex, nullable: false })
    sex: Sex;

    @IsString()
    @Length(0, 255)
    @Column({ length: 255, nullable: true })
    address: string;

    @IsString()
    @Length(0, 255)
    @Column({ length: 255, nullable: true })
    avatar: string;

    @IsNotEmpty()
    @IsEnum(UserRole)
    @Column({ type: "enum", enum: UserRole, nullable: false })
    roles: UserRole;
}
