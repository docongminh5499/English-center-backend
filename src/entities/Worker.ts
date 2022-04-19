import { Entity, JoinColumn, OneToOne, PrimaryColumn } from "typeorm";
import { MyBaseEntity } from "./MyBaseEntity";
import { User } from "./UserEntity";

@Entity()
export class Worker extends MyBaseEntity {

    @PrimaryColumn({type: "int", name: "workerId"})
    @OneToOne(() => User, {onDelete: "CASCADE", onUpdate: "CASCADE"})
    @JoinColumn({name: "workerId"})
    user: User;
}