import { Column, Entity, PrimaryColumn } from "typeorm";
import { IsEnum, IsNotEmpty, IsString, Length } from "class-validator";
import { MyBaseEntity } from "./MyBaseEntity";
import { TagsType } from "../utils/constants/tags.constant";

@Entity()
export class Tag extends MyBaseEntity {
  @IsNotEmpty()
  @IsString()
  @Length(0, 100)
  @PrimaryColumn({ length: 100 })
  name: string;

  @IsNotEmpty()
  @IsEnum(TagsType)
  @Column({ type: "enum", enum: TagsType, nullable: false })
  type: TagsType;
}
