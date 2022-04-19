import { Entity, JoinColumn, OneToMany, OneToOne, PrimaryColumn } from "typeorm";
import { MyBaseEntity } from "./MyBaseEntity";
import { User} from "./UserEntity";
import { UserStudent} from "./UserStudent";

@Entity()
export class UserParent extends MyBaseEntity {

  @OneToMany(()=>UserStudent, userStudent => userStudent.user.id)
  userStudent: UserStudent[];

  @PrimaryColumn({type: "int", name: "parentId"})
  @OneToOne(()=>User)
  @JoinColumn({name: "parentId"})
  user: User;
}