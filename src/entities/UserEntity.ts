import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, } from "typeorm";
import { IsNotEmpty,IsEnum, IsString, Length } from "class-validator";
import { UserRole } from "../utils/constants/role.constant";

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number

    @IsNotEmpty()
    @IsString()
    @Column({ length: 50, unique: true, nullable: false })
    email: string

    @IsString()
    @Length(0, 255)
    @Column()
    fullName: string

    @Length(10)
    @Column({ length: 10, nullable: false })
    phone: number

    @Column()
    age: number

    //1 male, 2 female, 3 undefine
    @Column()
    sex: number

    @IsString()
    @Length(0, 255)
    @Column({ length: 255, nullable: true })
    address: string

    @CreateDateColumn({ type: "timestamp" })
    createdU: Date;

    @UpdateDateColumn({ type: "timestamp" })
    updatedU: Date;

    @IsNotEmpty()
    @IsEnum(UserRole)
    @Column({ type: "enum", enum: UserRole, nullable: false })
    roles: UserRole;
    }