import { PageableDto } from "../../dto";
import MaskedComment from "../../dto/responses/maskedComment.dto";
import { Branch } from "../../entities/Branch";
import { Course } from "../../entities/Course";
import { Tag } from "../../entities/Tag";
import { CurriculumLevel } from "../../utils/constants/curriculum.constant";

export default interface GuestService {
    getBranches: () => Promise<Branch[]>;

    getStudentCount: () => Promise<number>;

    getCompletedCourseCount: () => Promise<number>;

    getCurriculumTags: () => Promise<Tag[]>;

    getTopComments: () => Promise<MaskedComment[]>;

    getCourses: (pageableDto: PageableDto, level?: CurriculumLevel, curriculumTag?: string, branchId?: number) => Promise<{ total: number, courses: Course[] }>;

    getCourseDetail: (courseSlug: string) => Promise<Course | null>;

    checkAttendCourse: (userId?: number, courseSlug?: string) => Promise<boolean>;
}