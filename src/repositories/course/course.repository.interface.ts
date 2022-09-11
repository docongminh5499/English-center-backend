import { Course } from "../../entities/Course";

export default interface CourseRepository {
    findCourseByTeacher: (teacherId?: number, 
        limit?: number, offset?: number,selectField?: string[]) => Promise<Course[]>;

    countCourseByTeacher: (teacherId?: number) => Promise<number>;
}