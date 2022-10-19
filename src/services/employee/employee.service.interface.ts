import { CreateCourseDto } from "../../dto";
import { Branch } from "../../entities/Branch";
import { Classroom } from "../../entities/Classroom";
import { Course } from "../../entities/Course";
import { Curriculum } from "../../entities/Curriculum";
import { Shift } from "../../entities/Shift";
import { UserEmployee } from "../../entities/UserEmployee";
import { UserTeacher } from "../../entities/UserTeacher";
import { UserTutor } from "../../entities/UserTutor";

export default interface EmployeeService {
    getPersonalInformation: (userId: number) => Promise<UserEmployee>;

    getCurriculumList: (userId?: number) => Promise<Curriculum[]>;

    getBranches: (userId?: number) => Promise<Branch[]>;

    getTeacherByBranchAndPreferedCurriculum: (userId?: number, branchId?: number, curriculumId?: number) => Promise<UserTeacher[]>;

    getTeacherFreeShifts: (userId?: number, teacherId?: number, beginingDate?: Date) => Promise<Shift[]>;

    getAvailableTutors: (userId?: number, beginingDate?: Date, shiftIds?: number[], branchId?: number) => Promise<UserTutor[]>;

    getAvailableClassroom: (userId?: number, beginingDate?: Date, shiftIds?: number[], branchId?: number) => Promise<Classroom[]>;

    createCourse: (userId?: number, createCourseDto?: CreateCourseDto) => Promise<Course | null>;
}