import { Entity } from "typeorm";
import { User } from "./UserEntity";

@Entity()
export class Worker extends User {}