import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { User} from "./UserEntity";
import { Fee} from "./Fee";
import { Exercise} from "./Exercise";
import { Question} from "./Question";
import { Notification} from "./Notification";

import { UserRole } from "../utils/constants/role.constant";

@Entity()
export class UserStudent extends User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  roles: UserRole.STUDENT;

  @ManyToOne(()=>Fee, fee => fee.money)
  fee: Fee;

  @ManyToOne(()=>Exercise, exercise => exercise.id)
  exercise: Exercise;

  @ManyToOne(()=>Question, question => question.answer)
  question: Question;

  @ManyToOne(()=>Notification, notification => notification.id)
  notification: Notification;
}