import { Entity, BaseEntity, VersionColumn } from "typeorm";

@Entity()
export class MyBaseEntity extends BaseEntity {
  @VersionColumn()
  version: number
}
