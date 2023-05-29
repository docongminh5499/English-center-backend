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
import { Transaction } from "./Transaction";
import { Notification } from "./Notification";
import { Question } from "./Question";
import { Salary } from "./Salary";
import { Shift } from "./Shift";
import { Tag } from "./Tag";
import { WrongAnswer } from "./WrongAnswer";

import { UserAdmin } from "./UserAdmin";
import { UserEmployee } from "./UserEmployee";
import { User } from "./UserEntity";
import { UserParent } from "./UserParent";
import { UserStudent } from "./UserStudent";
import { UserTeacher } from "./UserTeacher";
import { UserTutor } from "./UserTutor";
import { StudentParticipateCourse } from "./StudentParticipateCourse";
import { UserChatEachOther } from "./UsersChatEachOther";
import { UserAttendStudySession } from "./UserAttendStudySession";
import { MakeUpLession } from "./MakeUpLession";
import { StudentDoExercise } from "./StudentDoExercise";
import { Worker } from "./Worker";
import { SocketStatus } from "./SocketStatus";
import { TeacherPreferCurriculum } from "./TeacherPreferCurriculum";
import { Refund } from "./Refund";
import { TransactionConstants } from "./TransactionConstants";
import { CurriculumExercise } from "./CurriculumExercise";
import { QuestionStore } from "./QuestionStore";
import { WrongAnswerStore } from "./WrongAnswerStore";

module.exports = [
  Account,
  Shift,
  Exercise,
  Question,
  WrongAnswer,
  Tag,
  Document,
  Notification,
  Transaction,
  Salary,
  Fee,
  UserAdmin,
  UserEmployee,
  User,
  UserParent,
  UserStudent,
  UserTeacher,
  UserTutor,
  Worker,
  TeacherPreferCurriculum,
  Refund,
  TransactionConstants,
  //Hoc
  Branch,
  Classroom,
  Course,
  Curriculum,
  Lecture,
  StudySession,
  StudentParticipateCourse,
  UserChatEachOther,
  UserAttendStudySession,
  MakeUpLession,
  StudentDoExercise,
  SocketStatus,
  CurriculumExercise,
  QuestionStore,
  WrongAnswerStore,
];
