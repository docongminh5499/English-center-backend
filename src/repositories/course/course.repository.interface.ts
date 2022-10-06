
import { Pageable, Selectable, Sortable } from "..";
import { Course } from "../../entities/Course";
import { StudentParticipateCourse } from "../../entities/StudentParticipateCourse";
import Queryable from "../../utils/common/queryable.interface";

export default interface CourseRepository {
    findCourseByTeacher: (pageable: Pageable, sortable: Sortable,
        selectable: Selectable, queryable: Queryable<Course>, teacherId?: number) => Promise<Course[]>;

    countCourseByTeacher: (queryable: Queryable<Course>, teacherId?: number) => Promise<number>;

    findCourseForTimetableByStudent: (studentId: number) => Promise<Course[]>;

    findCourseByStudent: (pageable: Pageable, sortable: Sortable,
        selectable: Selectable, queryable: Queryable<StudentParticipateCourse>, teacherId?: number) => Promise<Course[]>;

    countCourseByStudent: (queryable: Queryable<StudentParticipateCourse>, teacherId?: number) => Promise<number>;
}