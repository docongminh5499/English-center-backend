import { Entity, Column, ManyToOne, JoinColumn, PrimaryGeneratedColumn } from "typeorm";
import { IsBoolean, IsDate, IsNotEmpty, IsString } from "class-validator";
import { MyBaseEntity } from "./MyBaseEntity";
import { User } from "./UserEntity";

//Relation User--N--Chat--N--User
@Entity()
export class UserChatEachOther extends MyBaseEntity {

  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn()
  sender: User;

  @ManyToOne(() => User, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn()
  receiver: User;

  @IsNotEmpty()
  @IsDate()
  @Column({ type: "timestamp", precision: 6, nullable: false })
  sendingTime: Date;

  @IsNotEmpty()
  @IsString()
  @Column({ type: "text", nullable: false })
  messageContent: string;

  @IsBoolean()
  @Column({ type: "boolean", default: false })
  read: boolean;
}