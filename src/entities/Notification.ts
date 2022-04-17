import { Entity, PrimaryGeneratedColumn, Column,  OneToOne } from "typeorm";
import { IsBoolean, IsNotEmpty, IsString } from "class-validator";
import { MyBaseEntity } from "./MyBaseEntity";
import { User } from "./UserEntity";

@Entity()
export class Notification extends MyBaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @IsNotEmpty()
  @IsString()
  @Column({ type: "text", nullable: false })
  content: string;

  @IsBoolean()
  @Column({ type: "bool", default: false })
  read: boolean;

  @OneToOne(type => User, user => user.id)
  user: User;
}
