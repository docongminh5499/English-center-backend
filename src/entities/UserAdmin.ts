import { Entity,OneToMany , OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { User} from "./UserEntity";
import { Branch} from "./Branch";

@Entity()
export class UserAdmin extends User {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToMany(() => User, user => user.id)
  user: User[];

  @OneToOne(() => Branch, branch => branch.id)
  branch: Branch;
}