import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from "typeorm";
import { IsDate, IsNotEmpty, IsString } from "class-validator";
import { MyBaseEntity } from "./MyBaseEntity";
import { User } from "./UserEntity";

//Relation User--N--Chat--N--User
@Entity()
export class UserChatEachOther extends MyBaseEntity {

  
  @PrimaryColumn({type: "int", name:"senderId"})
  @ManyToOne(() => User)
  @JoinColumn()
  sender: User;

  @PrimaryColumn({type: "int", name:"receiverId"})
  @ManyToOne(() => User)
  @JoinColumn()
  receiver: User;

  @IsDate()
  @Column({type: "timestamp", nullable: false})
  sendingTime: Date;

  @IsNotEmpty()
  @IsString()
  @Column({ type: "text", nullable: false })
  messageContent: string;
  
}