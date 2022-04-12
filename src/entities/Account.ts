import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";
import { IsNotEmpty, IsString, Length, IsEnum } from "class-validator";
import { AccountRole } from "../utils/constants/role.constant";
import { MyBaseEntity } from "./MyBaseEntity";

@Entity()
export class Account extends MyBaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @IsNotEmpty()
  @IsString()
  @Length(0, 50)
  @Column({ length: 50, unique: true, nullable: false })
  username: string;

  @IsNotEmpty()
  @IsString()
  @Length(0, 100)
  @Column({ length: 100, nullable: false })
  password: string;

  @IsNotEmpty()
  @IsEnum(AccountRole)
  @Column({ type: "enum", enum: AccountRole, nullable: false })
  role: AccountRole;
}
