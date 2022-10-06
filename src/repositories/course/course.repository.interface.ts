
import { Pageable, Selectable, Sortable } from "..";
import { Course } from "../../entities/Course";
import Queryable from "../../utils/common/queryable.interface";

export default interface CourseRepository {
    findCourseByTeacher: (pageable: Pageable, sortable: Sortable,
        selectable: Selectable, queryable: Queryable<Course>, teacherId?: number) => Promise<Course[]>;

    countCourseByTeacher: (queryable: Queryable<Course>, teacherId?: number) => Promise<number>;

    findCourseByStudent: (studentId: number) => Promise<Course[]>;

    findCourseBySlug: (courseSlug: string) => Promise<Course | null>;
}