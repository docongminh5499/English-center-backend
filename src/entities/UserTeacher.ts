import { IsNotEmpty, IsString, Length } from "class-validator";
import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryColumn } from "typeorm";
import { Course } from "./Course";
import { MyBaseEntity } from "./MyBaseEntity";
import { StudySession } from "./StudySession";
import { Worker } from "./Worker";

@Entity()
export class UserTeacher extends MyBaseEntity {
  @IsNotEmpty()
  @IsString()
  @Length(0, 255)
  @Column({ length: 255, nullable: false, unique: true })
  slug: string;

  @OneToMany(() => Course, (course) => course.teacher)
  courses: Course[];

  @PrimaryColumn({ type: "int", name: "teacherId" })
  @OneToOne(() => Worker, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn({ name: "teacherId" })
  worker: Worker;

  @IsString()
  @Column({ type: "text", nullable: true })
  experience: string | null;

  @IsString()
  @Column({ type: "text", nullable: true })
  shortDesc: string | null;

  @OneToMany(() => StudySession, (studySession) => studySession.teacher)
  studySessions: StudySession[];
}
