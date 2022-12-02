import {
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryColumn,
} from "typeorm";
import { User } from "./UserEntity";
import { MyBaseEntity } from "./MyBaseEntity";
import { UserParent } from "./UserParent";
import { IsOptional } from "class-validator";

@Entity()
export class UserStudent extends MyBaseEntity {
  @PrimaryColumn({ type: "int", name: "studentId" })
  @OneToOne(() => User, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn({ name: "studentId" })
  user: User;

  @IsOptional()
  @ManyToOne(() => UserParent, (userParent) => userParent.userStudents, {
    nullable: true,
  })
  @JoinColumn({ name: "parentId" })
  userParent: UserParent | null;
}
