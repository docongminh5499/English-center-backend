import { Entity, PrimaryGeneratedColumn, Column,OneToMany } from "typeorm";
import { User} from "./UserEntity";
import { UserStudent} from "./UserStudent";
import { UserRole } from "../utils/constants/role.constant";

@Entity()
export class UserParent extends User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  roles: UserRole.PARENT;

  @OneToMany(()=>UserStudent, userStudent => userStudent.id)
  userStudent: UserStudent[];
}