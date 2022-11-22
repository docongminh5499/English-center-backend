import { Entity, PrimaryGeneratedColumn, Column, OneToMany, Index } from "typeorm";
import { IsNotEmpty, IsEnum, IsString, Length, IsDate, IsOptional } from "class-validator";
import { UserRole } from "../utils/constants/role.constant";
import { MyBaseEntity } from "./MyBaseEntity";
import { Sex } from "../utils/constants/sex.constant";
import { SocketStatus } from "./SocketStatus";

@Entity()
export class User extends MyBaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @IsOptional()
    @IsString()
    @Column({ type:'varchar', length: 50, unique: true, nullable: true })
    email: string | null;

    @Index()
    @IsNotEmpty()
    @IsString()
    @Length(0, 50)
    @Column({type:'varchar', length: 50, nullable: false })
    fullName: string;

    @IsOptional()
    @IsString()
    @Length(0, 11)
    @Column({type:'varchar', length: 11, nullable: true })
    phone: string | null;

    @IsNotEmpty()
    @IsDate()
    @Column({ type: "date", nullable: false })
    dateOfBirth: Date

    @IsNotEmpty()
    @IsEnum(Sex)
    @Column({ type: "enum", enum: Sex, nullable: false })
    sex: Sex;

    @IsOptional()
    @IsString()
    @Length(0, 255)
    @Column({type:'varchar', length: 255, nullable: true })
    address: string | null;

    @IsOptional()
    @IsString()
    @Length(0, 255)
    @Column({type:'varchar', length: 255, nullable: true })
    avatar: string | null;

    @IsNotEmpty()
    @IsEnum(UserRole)
    @Column({ type: "enum", enum: UserRole, nullable: false })
    role: UserRole;

    @OneToMany(() => SocketStatus, socketStatus => socketStatus.user)
    socketStatuses: SocketStatus[];
}
