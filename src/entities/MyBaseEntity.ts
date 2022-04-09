import { CreateDateColumn, UpdateDateColumn, Column, Entity, BaseEntity } from "typeorm";

@Entity()
export class MyBaseEntity extends BaseEntity {
  @CreateDateColumn({ type: "timestamp" })
  createdAt: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updatedAt: Date;

  @Column({ type: "text", nullable: true })
  description: string;
}
