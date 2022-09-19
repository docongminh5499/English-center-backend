import { Entity, JoinColumn, OneToOne, PrimaryColumn } from "typeorm";
import { User} from "./UserEntity";
import { MyBaseEntity } from "./MyBaseEntity";

@Entity()
export class UserAdmin extends MyBaseEntity {

  @PrimaryColumn({type: "int", name: "adminId"})
  @OneToOne(()=>User, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn({name: "adminId"})
  user: User;
  
}