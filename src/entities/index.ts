import { Account } from "./Account";
import { Branch } from "./Branch";
import { Classroom } from "./Classroom";
import { Course } from "./Course";
import { Curriculum } from "./Curriculum";
import { Document } from "./Document";
import { Exercise } from "./Exercise";
import { Fee } from "./Fee";
import { Lecture } from "./Lecture";
import { StudySession } from "./StudySession";
import { Money } from "./Money";
import { Notification } from "./Notification";
import { Question } from "./Question";
import { Salary } from "./Salary";
import { Schedule } from "./Schedule";
import { Shift } from "./Shift";
import { Tag } from "./Tag";
import { WrongAnswer } from "./WrongAnswer";

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
  //Hoc
  Branch,
  Classroom,
  Course,
  Curriculum,
  Lecture,
  StudySession,
  Schedule,
];
