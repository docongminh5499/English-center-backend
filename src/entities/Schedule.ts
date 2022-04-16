import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";
import { MyBaseEntity } from "./MyBaseEntity";

@Entity()
export class Schedule extends MyBaseEntity {
  @PrimaryGeneratedColumn()
  id: number;
}