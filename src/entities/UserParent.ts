import { Entity, PrimaryGeneratedColumn, OneToMany } from "typeorm";
import { User} from "./UserEntity";
import { UserStudent} from "./UserStudent";

@Entity()
export class UserParent extends User {
  @PrimaryGeneratedColumn()
  id: number;


  @OneToMany(()=>UserStudent, userStudent => userStudent.id)
  userStudent: UserStudent[];
}