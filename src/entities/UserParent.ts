import { Entity, OneToMany } from "typeorm";
import { User} from "./UserEntity";
import { UserStudent} from "./UserStudent";

@Entity()
export class UserParent extends User {

  @OneToMany(()=>UserStudent, userStudent => userStudent.id)
  userStudent: UserStudent[];
}