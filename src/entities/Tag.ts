import { Entity, PrimaryColumn } from "typeorm";
import { IsNotEmpty, IsString, Length } from "class-validator";
import { MyBaseEntity } from "./MyBaseEntity";

@Entity()
export class Tag extends MyBaseEntity {
  @IsNotEmpty()
  @IsString()
  @Length(0, 100)
  @PrimaryColumn({ length: 100 })
  name: string;
}
