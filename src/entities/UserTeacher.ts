import { Entity,  PrimaryGeneratedColumn } from "typeorm";
import { Worker } from "./Worker";


@Entity()
export class UserTeacher extends Worker {
    @PrimaryGeneratedColumn()
    id: number;

}