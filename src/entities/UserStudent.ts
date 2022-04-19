import {
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryColumn,
} from "typeorm";
import { User } from "./UserEntity";
import { Fee } from "./Fee";
import { MyBaseEntity } from "./MyBaseEntity";
import { UserParent } from "./UserParent";

@Entity()
export class UserStudent extends MyBaseEntity {
  @OneToMany(() => Fee, (fee) => fee.money)
  fees: Fee[];

  @PrimaryColumn({ type: "int", name: "studentId" })
  @OneToOne(() => User)
  @JoinColumn({ name: "studentId" })
  user: User;

  @ManyToOne(() => UserParent)
  @JoinColumn({ name: "parentId" })
  userParent: UserParent;
}
