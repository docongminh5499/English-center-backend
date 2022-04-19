import { Entity, Column, OneToOne, JoinColumn, PrimaryColumn } from "typeorm";
import { IsNotEmpty, IsString, Length, IsEnum } from "class-validator";
import { AccountRole } from "../utils/constants/role.constant";
import { MyBaseEntity } from "./MyBaseEntity";
import { User } from "./UserEntity";

@Entity()
export class Account extends MyBaseEntity {
  @IsNotEmpty()
  @IsString()
  @Length(0, 50)
  @PrimaryColumn({ length: 50, nullable: false })
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
  
  //Relation User==1==<has>==1==Account
  @IsNotEmpty()
  @OneToOne(() => User, {onDelete: "CASCADE", onUpdate: "CASCADE", nullable: false})
  @JoinColumn()
  user: User;
}
