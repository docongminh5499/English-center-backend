import { Entity, PrimaryGeneratedColumn } from "typeorm";
import { MyBaseEntity } from "./MyBaseEntity";

@Entity()
export class Money extends MyBaseEntity {
  @PrimaryGeneratedColumn()
  id: number;
}
