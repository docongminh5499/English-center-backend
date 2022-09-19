import { Entity, JoinColumn, OneToMany, OneToOne, PrimaryColumn } from "typeorm";
import { MyBaseEntity } from "./MyBaseEntity";
import { User} from "./UserEntity";
import { UserStudent} from "./UserStudent";

@Entity()
export class UserParent extends MyBaseEntity {

  @OneToMany(()=>UserStudent, userStudent => userStudent.userParent)
  userStudents: UserStudent[];

  @PrimaryColumn({type: "int", name: "parentId"})
  @OneToOne(()=>User, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn({name: "parentId"})
  user: User;
}