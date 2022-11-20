
import { Pageable, Selectable, Sortable } from "..";
import { Course } from "../../entities/Course";
import Queryable from "../../utils/common/queryable.interface";
import { CurriculumLevel } from "../../utils/constants/curriculum.constant";

export default interface CourseRepository {
    findCourseByTeacher: (pageable: Pageable, sortable: Sortable, queryable: Queryable<Course>, teacherId: number) => Promise<Course[]>;

    countCourseByTeacher: (queryable: Queryable<Course>, teacherId: number) => Promise<number>;

    findCourseForTimetableByStudent: (studentId: number) => Promise<Course[]>;

    findCourseByStudent: (pageable: Pageable, sortable: Sortable,
        selectable: Selectable, queryable: Queryable<Course>, teacherId?: number) => Promise<Course[]>;

    countCourseByStudent: (queryable: Queryable<Course>, teacherId?: number) => Promise<number>;

    findCourseBySlug: (courseSlug: string) => Promise<Course | null>;

    findCourseById: (courseId: number) => Promise<Course | null>;

    countByCurriculumId: (curriculumId: number) => Promise<number>;

    findBriefCourseBySlug: (courseSlug: string) => Promise<Course | null>;

    findCourseByBranch: (pageable: Pageable, sortable: Sortable,
        selectable: Selectable, queryable: Queryable<Course>, branchId?: number) => Promise<Course[]>;

    countCourseByBranch: (queryable: Queryable<Course>, branchId?: number) => Promise<number>;

    countCourseByTutor: (queryable: Queryable<Course>, tutorId: number) => Promise<number>;

    findCourseByTutor: (pageable: Pageable, sortable: Sortable, queryable: Queryable<Course>, tutorId: number) => Promise<Course[]>;

    countCompletedCourse: () => Promise<number>;

    getCoursesForGuest: (pageable: Pageable, level?: CurriculumLevel, curriculumTag?: string, branchId?: number) => Promise<Course[]>;

    countCoursesForGuest: (level?: CurriculumLevel, curriculumTag?: string, branchId?: number) => Promise<number>;

    getCourseDetailForGuest: (courseSlug: string) => Promise<Course | null>;
}