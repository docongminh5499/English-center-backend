import { Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Branch } from "./Branch";
import { MyBaseEntity } from "./MyBaseEntity";

@Entity()
export class Money extends MyBaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Branch, {onDelete: "CASCADE", onUpdate: "CASCADE", nullable: false})
  branch: Branch;
}
