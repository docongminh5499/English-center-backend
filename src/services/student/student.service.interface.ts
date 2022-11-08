import { CourseListDto, PageableDto } from "../../dto";
import { Course } from "../../entities/Course";
import { Document } from "../../entities/Document";
import { Exercise } from "../../entities/Exercise";
import { StudentDoExercise } from "../../entities/StudentDoExercise";
import { UserAttendStudySession } from "../../entities/UserAttendStudySession";
import Queryable from "../../utils/common/queryable.interface";


export default interface StudentService {
    getCoursesForTimetableByStudent: (studentId: number) => Promise<Course[]>;

    getCoursesByStudent: (studentId: number, pageableDto: PageableDto, queryable: Queryable<Course>) => Promise<CourseListDto>;

    getCourseDetail: (studentId: number, courseSlug: string) => Promise<Partial<Course> | null>;

    assessCourse: (studentId: number, courseId: number, content: any) => Promise<boolean>;

    getAttendance: (studentId: number, courseSlug: string) => Promise<UserAttendStudySession[]>;

    getAllExercises: (courseId: number) => Promise<Exercise[] | null>;

    submitExercise: (studentId: number, exerciseId: number, answer: any) => Promise<StudentDoExercise | null>;

    getStudentDoExercise: (studentId: number, courseId: number) => Promise<StudentDoExercise[] | null>;

    getDocument: (courseId: number) => Promise<Document[] | null>;
    
}