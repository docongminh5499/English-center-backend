import { CourseListDto, PageableDto } from "../../dto";
import { Course } from "../../entities/Course";
import { Exercise } from "../../entities/Exercise";
import { StudentDoExercise } from "../../entities/StudentDoExercise";
import { UserAttendStudySession } from "../../entities/UserAttendStudySession";
import { UserParent } from "../../entities/UserParent";
import Queryable from "../../utils/common/queryable.interface";


export default interface ParentService {
	getUserParent: (parentId: number) => Promise<UserParent | null>;

	getCoursesForTimetableByParent: (studentId: number) => Promise<Course[] | null>;

	getPagecbleStudentCourses: (studentId: number, pageableDto: PageableDto, queryable: Queryable<Course>) => Promise<CourseListDto>;

	getCourseDetail: (studentId: number, courseSlug: string) => Promise<Course | null>;

	getAttendance: (studentId: number, courseSlug: string) => Promise<UserAttendStudySession[]>;

	getAllExercises: (courseId: number) => Promise<Exercise[] | null>;

	getStudentDoExercise: (studentId: number, courseId: number) => Promise<StudentDoExercise[] | null>;
}