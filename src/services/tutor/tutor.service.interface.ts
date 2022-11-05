import { CourseDetailDto, CourseListDto, CredentialDto, FileDto, PageableDto } from "../../dto";
import { Course } from "../../entities/Course";
import { MakeUpLession } from "../../entities/MakeUpLession";
import { Shift } from "../../entities/Shift";
import { StudySession } from "../../entities/StudySession";
import { UserAttendStudySession } from "../../entities/UserAttendStudySession";
import { UserEmployee } from "../../entities/UserEmployee";
import { UserStudent } from "../../entities/UserStudent";
import { UserTutor } from "../../entities/UserTutor";
import Queryable from "../../utils/common/queryable.interface";

export default interface TutorService {
  getCoursesByTutor: (tutorId: number, pageableDto: PageableDto, queryable: Queryable<Course>) => Promise<CourseListDto>;

  getAllShifts: (tutorId?: number) => Promise<Shift[]>;

  getFreeShifts: (tutorId?: number) => Promise<Shift[]>;

  updateFreeShifts: (tutorId?: number, shiftIds?: number[]) => Promise<void>;

  getPersonalInformation: (userId: number) => Promise<UserTutor>;

  modifyPersonalInformation: (userId: number, userTutor: UserTutor, avatarFile?: FileDto | null) => Promise<CredentialDto | null>;

  getSchedule: (pageableDto: PageableDto, userId?: number, startDate?: Date, endDate?: Date) => Promise<{ total: number, studySessions: StudySession[] }>;

  getCourseDetail: (tutorId: number, courseSlug: string) => Promise<Partial<CourseDetailDto> | null>;

  getStudents: (userId: number, courseSlug: string, query: string, pageableDto: PageableDto) => Promise<{ total: number, students: UserStudent[] }>;

  getStudentDetailsInCourse: (userId: number, studentId: number, courseSlug: string) => Promise<{ student: UserStudent}>;

  getEmployeeByBranch: (userId?: number, branchId?: number) => Promise<UserEmployee[]>;

  getStudySessions: (tutorId: number, courseSlug: string,
    pageableDto: PageableDto) => Promise<{ total: number, studySessions: StudySession[] }>;

  getStudySessionDetail: (tutorId?: number, studySessionId?: number)
    => Promise<{ studySession: StudySession | null, attendences: UserAttendStudySession[], makeups: MakeUpLession[], ownMakeups: MakeUpLession[] }>;
}