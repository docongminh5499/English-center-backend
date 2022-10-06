import { CourseListDto, PageableDto } from "../../dto";
import { Course } from "../../entities/Course";
import { StudentParticipateCourse } from "../../entities/StudentParticipateCourse";
import Queryable from "../../utils/common/queryable.interface";


export default interface StudentService {
    getCoursesForTimetableByUsername: (username: string) => Promise<Course[]>;

    getCoursesByStudent: (studentId: number, pageableDto: PageableDto, queryable: Queryable<StudentParticipateCourse>) => Promise<CourseListDto>;
}