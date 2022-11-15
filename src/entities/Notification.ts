import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { IsBoolean, IsDate, IsNotEmpty, IsString } from "class-validator";
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

  @ManyToOne(() => User, {onDelete: "CASCADE", onUpdate: "CASCADE", nullable: false})
  user: User;

  @IsNotEmpty()
  @IsDate()
  @Column({ type: "timestamp", precision: 6, nullable: true })
  createdAt: Date;
}
