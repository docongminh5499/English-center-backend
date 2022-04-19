import { Entity, JoinColumn, OneToOne, PrimaryColumn } from "typeorm";
import { MyBaseEntity } from "./MyBaseEntity";
import { Worker } from "./Worker";


@Entity()
export class UserEmployee extends MyBaseEntity {

    @PrimaryColumn({type: "int", name: "employeeId"})
    @OneToOne(()=>Worker)
    @JoinColumn({name: "employeeId"})
    worker: Worker;
}