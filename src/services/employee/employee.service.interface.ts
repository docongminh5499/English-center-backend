import { ClassroomDto, CourseDetailDto, CourseListDto, CreateCourseDto, CredentialDto, FileDto, PageableDto, StudySessionDto } from "../../dto";
import { Branch } from "../../entities/Branch";
import { Classroom } from "../../entities/Classroom";
import { Course } from "../../entities/Course";
import { Curriculum } from "../../entities/Curriculum";
import { Fee } from "../../entities/Fee";
import { Refund } from "../../entities/Refund";
import { Salary } from "../../entities/Salary";
import { Shift } from "../../entities/Shift";
import { StudySession } from "../../entities/StudySession";
import { UserEmployee } from "../../entities/UserEmployee";
import { UserParent } from "../../entities/UserParent";
import { UserStudent } from "../../entities/UserStudent";
import { UserTeacher } from "../../entities/UserTeacher";
import { UserTutor } from "../../entities/UserTutor";
import Queryable from "../../utils/common/queryable.interface";

export default interface EmployeeService {
    getPersonalInformation: (userId: number) => Promise<UserEmployee>;

    modifyPersonalInformation: (userId: number, userEmployee: UserEmployee, avatarFile?: FileDto | null) => Promise<CredentialDto | null>;

    getCurriculumList: (userId?: number) => Promise<Curriculum[]>;

    getBranches: (userId?: number) => Promise<Branch[]>;

    getTeacherByBranchAndPreferedCurriculum: (userId?: number, branchId?: number, curriculumId?: number) => Promise<UserTeacher[]>;

    getTeacherFreeShifts: (userId?: number, teacherId?: number, beginingDate?: Date) => Promise<Shift[]>;

    getAvailableTutors: (userId?: number, beginingDate?: Date, shiftIds?: number[], branchId?: number) => Promise<UserTutor[]>;

    getAvailableClassroom: (userId?: number, beginingDate?: Date, shiftIds?: number[], branchId?: number) => Promise<Classroom[]>;

    getCoursesByBranch: (employeeId: number, pageableDto: PageableDto, queryable: Queryable<Course>) => Promise<CourseListDto>;

    getCourseDetail: (employeeId: number, courseSlug: string) => Promise<Partial<CourseDetailDto> | null>;

    getStudySessions: (employeeId: number, courseSlug: string,
        pageableDto: PageableDto, query?: string) => Promise<{ total: number, studySessions: StudySession[] }>;

    createCourse: (userId?: number, createCourseDto?: CreateCourseDto) => Promise<Course | null>;

    closeCourse: (userId?: number, courseSlug?: string) => Promise<Course | null>;

    repoenCourse: (userId?: number, courseSlug?: string) => Promise<Course | null>;

    removeCourse: (userId?: number, courseSlug?: string) => Promise<boolean>;

    getShifts: (date: Date) => Promise<Shift[]>;

    getAvailableTeachersInDate: (userId?: number, date?: Date, shiftIds?: number[], studySession?: number, curriculumId?: number, branchId?: number) => Promise<UserTeacher[]>;

    getAvailableTutorsInDate: (userId?: number, date?: Date, shiftIds?: number[], studySession?: number, branchId?: number) => Promise<UserTutor[]>;

    getAvailableClassroomInDate: (userId?: number, date?: Date, shiftIds?: number[], studySession?: number, branchId?: number) => Promise<Classroom[]>;

    getAvaiableStudentCount: (userId?: number, studySessionId?: number, courseSlug?: string, date?: Date, shiftIds?: number[]) => Promise<{ total: number, free: number, acceptedPercent: number }>;

    addStudySession: (userId?: number, courseSlug?: string, studySessionDto?: StudySessionDto) => Promise<StudySession | null>;

    updateStudySession: (userId?: number, studySessionDto?: StudySessionDto) => Promise<StudySession | null>;

    removeStudySession: (userId?: number, studySessionId?: number) => Promise<boolean>;

    getClassrooms: (userId?: number, pageableDto?: PageableDto, query?: string) => Promise<{ total: number, classrooms: Classroom[] }>;

    addClassroom: (userId?: number, classroomDto?: ClassroomDto) => Promise<Classroom | null>;

    modifyClassroom: (userId?: number, classroomDto?: ClassroomDto) => Promise<Classroom | null>;

    removeClassroom: (userId?: number, name?: string, branchId?: number) => Promise<boolean>;

    getStudentsParicipateCourse: (userId: number, courseSlug: string, query: string, pageableDto: PageableDto) => Promise<{ total: number, students: UserStudent[] }>;

    getAllStudents: (userId: number, query: string, pageableDto: PageableDto, checkQuery?: boolean) => Promise<{ total: number, students: UserStudent[] }>;

    getStudentDetails: (userId: number, studentId: number) => Promise<{ student: UserStudent }>;

    getAllParents: (userId: number, query: string, pageableDto: PageableDto) => Promise<{ total: number, parents: UserParent[] }>;

    modifyParent: (userId: number, parentId: number, studentId: number, version: number) => Promise<UserParent | null>;

    getPersonalSalaries: (userId: number, pageableDto: PageableDto, fromDate: Date, toDate: Date) => Promise<{ total: number, salaries: Salary[] }>;

    getFeeAmount: (userId: number, courseSlug: string) => Promise<number>;

    addStudentParticipateCourse: (userId: number, courseSlug: string, studentId: number) => Promise<boolean>;

    getSalariesByBranch: (userId: number, pageableDto: PageableDto, fromDate: Date, toDate: Date) => Promise<{ total: number, salaries: Salary[] }>;

    getFeeByBranch: (userId: number, pageableDto: PageableDto, fromDate: Date, toDate: Date) => Promise<{ total: number, fees: Fee[] }>;

    getRefundByBranch: (userId: number, pageableDto: PageableDto, fromDate: Date, toDate: Date) => Promise<{ total: number, refunds: Refund[] }>;

    getTeacherByBranch: (userId: number, query: string, pageableDto: PageableDto) => Promise<{ total: number, teachers: UserTeacher[] }>;

    getTutorByBranch: (userId: number, query: string, pageableDto: PageableDto) => Promise<{ total: number, tutors: UserTutor[] }>;

    getEmployeeByBranch: (userId: number, query: string, pageableDto: PageableDto) => Promise<{ total: number, employees: UserEmployee[] }>;
}