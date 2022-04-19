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
  @PrimaryColumn({ type: "int", name: "studentId" })
  @OneToOne(() => User)
  @JoinColumn({ name: "studentId" })
  user: User;

  @OneToMany(() => Fee, (fee) => fee.money)
  fees: Fee[];

  @ManyToOne(() => UserParent, (userParent) => userParent.userStudents, {
    nullable: true,
  })
  @JoinColumn({ name: "parentId" })
  userParent: UserParent;
}
