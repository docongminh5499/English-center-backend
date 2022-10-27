import { CourseDetailDto, CourseListDto, CreateCourseDto, PageableDto } from "../../dto";
import { Branch } from "../../entities/Branch";
import { Classroom } from "../../entities/Classroom";
import { Course } from "../../entities/Course";
import { Curriculum } from "../../entities/Curriculum";
import { Shift } from "../../entities/Shift";
import { StudySession } from "../../entities/StudySession";
import { UserEmployee } from "../../entities/UserEmployee";
import { UserTeacher } from "../../entities/UserTeacher";
import { UserTutor } from "../../entities/UserTutor";
import Queryable from "../../utils/common/queryable.interface";

export default interface EmployeeService {
    getPersonalInformation: (userId: number) => Promise<UserEmployee>;

    getCurriculumList: (userId?: number) => Promise<Curriculum[]>;

    getBranches: (userId?: number) => Promise<Branch[]>;

    getTeacherByBranchAndPreferedCurriculum: (userId?: number, branchId?: number, curriculumId?: number) => Promise<UserTeacher[]>;

    getTeacherFreeShifts: (userId?: number, teacherId?: number, beginingDate?: Date) => Promise<Shift[]>;

    getAvailableTutors: (userId?: number, beginingDate?: Date, shiftIds?: number[], branchId?: number) => Promise<UserTutor[]>;

    getAvailableClassroom: (userId?: number, beginingDate?: Date, shiftIds?: number[], branchId?: number) => Promise<Classroom[]>;

    getCoursesByBranch: (employeeId: number, pageableDto: PageableDto, queryable: Queryable<Course>) => Promise<CourseListDto>;

    getCourseDetail: (employeeId: number, courseSlug: string) => Promise<Partial<CourseDetailDto> | null>;

    getStudySessions: (employeeId: number, courseSlug: string,
        pageableDto: PageableDto) => Promise<{ total: number, studySessions: StudySession[] }>;

    createCourse: (userId?: number, createCourseDto?: CreateCourseDto) => Promise<Course | null>;

    repoenCourse: (userId?: number, courseSlug?: string) => Promise<Course | null>;
}