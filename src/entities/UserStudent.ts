import { Entity, JoinColumn, ManyToOne, OneToOne, PrimaryColumn } from "typeorm";
import { User} from "./UserEntity";
import { Fee} from "./Fee";
import { Exercise} from "./Exercise";
import { Question} from "./Question";
import { Notification} from "./Notification";
import { MyBaseEntity } from "./MyBaseEntity";
import { UserParent } from "./UserParent";

@Entity()
export class UserStudent extends MyBaseEntity {
  @ManyToOne(()=>Fee, fee => fee.money)
  fee: Fee;

  @ManyToOne(()=>Exercise, exercise => exercise.id)
  exercise: Exercise;

  @ManyToOne(()=>Question, question => question.answer)
  question: Question;

  @ManyToOne(()=>Notification, notification => notification.id)
  notification: Notification;

  @PrimaryColumn({type: "int", name: "studentId"})
  @OneToOne(()=>User)
  @JoinColumn({name: "studentId"})
  user: User;

  @ManyToOne(()=>UserParent)
  @JoinColumn({name: "parentId"})
  userParent: UserParent;
}