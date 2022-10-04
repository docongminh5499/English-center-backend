import { CreateDateColumn, UpdateDateColumn, Entity, BaseEntity, VersionColumn } from "typeorm";

@Entity()
export class MyBaseEntity extends BaseEntity {
  @CreateDateColumn({ type: "timestamp" })
  createdAt: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updatedAt: Date;

  @VersionColumn()
  version: number
}
