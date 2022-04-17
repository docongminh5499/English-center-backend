import { Account } from "./Account";
import { Document } from "./Document";
import { Exercise } from "./Exercise";
import { Fee } from "./Fee";
import { Money } from "./Money";
import { Notification } from "./Notification";
import { Question } from "./Question";
import { Salary } from "./Salary";
import { Shift } from "./Shift";
import { Tag } from "./Tag";
import { WrongAnswer } from "./WrongAnswer";

import { UserAdmin } from "./UserAdmin";
import { UserEmployee } from "./UserEmployee";
import { User } from "./UserEntity";
import { UserParent} from "./UserParent";
import { UserStudent} from "./UserStudent";
import { UserTeacher} from "./UserTeacher";
import { UserTutor} from "./UserTutor";


module.exports = [
  Account,
  Shift,
  Exercise,
  Question,
  WrongAnswer,
  Tag,
  Document,
  Notification,
  Money,
  Salary,
  Fee,
  UserAdmin,
  UserEmployee,
  User,
  UserParent,
  UserStudent,
  UserTeacher,
  UserTutor
];
