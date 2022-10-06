import { CourseListDto, PageableDto } from "../../dto";
import { Course } from "../../entities/Course";
import Queryable from "../../utils/common/queryable.interface";

export default interface TeacherService {
    getCoursesByTeacher: (teacherId: number, pageableDto: PageableDto, queryable: Queryable<Course>) => Promise<CourseListDto>;

    getCourseDetail: (teacherId: number, courseSlug: string) => Promise<Partial<Course> | null>;

    deleteExercise: (teacherId: number, exerciseId: number) => Promise<boolean>;
}