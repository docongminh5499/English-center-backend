import { Entity,OneToMany , PrimaryGeneratedColumn, Column } from "typeorm";
import { User} from "./UserEntity";
import { UserRole } from "../utils/constants/role.constant";

@Entity()
export class UserAdmin extends User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  roles: UserRole.ADMIN;

  @OneToMany(() => User, user => user.id)
  user: User[];
}