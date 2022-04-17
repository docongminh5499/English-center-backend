import { Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Worker } from "./Worker";
import { UserTeacher } from "./UserTeacher";
import { UserTutor } from "./UserTutor";


@Entity()
export class UserEmployee extends Worker {
    @PrimaryGeneratedColumn()
    id: number;

    @OneToMany(() => UserTeacher, userTeacher => userTeacher.id)
    userTeacher: UserTeacher[];

    @OneToMany(() => UserTutor, userTutor => userTutor.id)
    userTutor: UserTutor[];

}