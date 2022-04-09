import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";
import { IsNotEmpty, IsString, Length } from "class-validator";
import { AccountRole } from "../utils/constants/role.constant";
import { MyBaseEntity } from "./MyBaseEntity";

@Entity()
export class Account extends MyBaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @IsNotEmpty()
  @IsString()
  @Length(0, 50)
  @Column({ length: 50, unique: true })
  username!: string;

  @IsNotEmpty()
  @IsString()
  @Length(0, 100)
  @Column({ length: 100 })
  password!: string;

  @IsNotEmpty()
  @Column({ type: "enum", enum: AccountRole })
  role!: AccountRole;
}
