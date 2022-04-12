import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";
import { IsBoolean, IsNotEmpty, IsString } from "class-validator";
import { MyBaseEntity } from "./MyBaseEntity";

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
}
