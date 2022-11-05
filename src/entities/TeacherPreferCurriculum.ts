import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { Curriculum } from "./Curriculum";
import { MyBaseEntity } from "./MyBaseEntity";
import { UserTeacher } from "./UserTeacher";

@Entity()
export class TeacherPreferCurriculum extends MyBaseEntity {
    @PrimaryColumn({ type: "int", name: "teacherId" })
    @ManyToOne(() => UserTeacher, { onDelete: "CASCADE", onUpdate: "CASCADE" })
    @JoinColumn({ name: "teacherId" })
    teacher: UserTeacher;
  
    @PrimaryColumn({ type: "int", name: "curriculumId" })
    @ManyToOne(() => Curriculum, { onDelete: "CASCADE", onUpdate: "CASCADE" })
    @JoinColumn({ name: "curriculumId" })
    curriculum: Curriculum;
}