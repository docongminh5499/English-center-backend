import { Entity, OneToMany } from "typeorm";
import { Worker } from "./Worker";
import { UserTeacher } from "./UserTeacher";
import { UserTutor } from "./UserTutor";


@Entity()
export class UserEmployee extends Worker {

    @OneToMany(() => UserTeacher, userTeacher => userTeacher.id)
    userTeacher: UserTeacher[];

    @OneToMany(() => UserTutor, userTutor => userTutor.id)
    userTutor: UserTutor[];

}