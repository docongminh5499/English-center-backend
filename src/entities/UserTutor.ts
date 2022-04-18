import { Entity,  JoinColumn,  OneToOne } from "typeorm";
import { Worker } from "./Worker";


@Entity()
export class UserTutor {

    @OneToOne(() => Worker, {onUpdate: "CASCADE", onDelete: "RESTRICT",})
    @JoinColumn()
    worker: Worker;
}