import { StudentParticipateCourse } from "../../entities/StudentParticipateCourse";
import Pageable from "../helpers/pageable";

export default interface StudentParticipateCourseRepository {
    findStudentsByCourseSlug: (courseSlug: string, pageable: Pageable, query?: string) => Promise<StudentParticipateCourse[]>;

    countStudentsByCourseSlug: (courseSlug: string, query?: string | undefined) => Promise<number>;

    countCommentsByCourseSlug: (courseSlug: string) => Promise<number>;

    countStarPointsTypeByCourseSlug: (courseSlug: string) => Promise<object>;

    getAverageStarPointByCourseSlug: (courseSlug: string) => Promise<number>;

    getCommentsByCourseSlug: (courseSlug: string, pageable: Pageable) => Promise<StudentParticipateCourse[]>;

    checkStudentParticipateCourse: (studentId: number, courseSlug: string) => Promise<boolean>;

    getTopComments: () => Promise<StudentParticipateCourse[]>;
}