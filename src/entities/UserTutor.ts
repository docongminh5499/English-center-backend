import { Entity,  PrimaryGeneratedColumn } from "typeorm";
import { Worker } from "./Worker";


@Entity()
export class UserTutor extends Worker {
    @PrimaryGeneratedColumn()
    id: number;
}