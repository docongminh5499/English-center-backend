import { Entity, OneToMany, OneToOne } from "typeorm";
import { User} from "./UserEntity";
import { Branch} from "./Branch";

@Entity()
export class UserAdmin extends User {

  @OneToMany(() => User, user => user.id)
  user: User[];

  @OneToOne(() => Branch, branch => branch.id)
  branch: Branch;
}