import { CourseListDto, PageableDto } from "../../dto";
import { Course } from "../../entities/Course";
import { UserParent } from "../../entities/UserParent";
import Queryable from "../../utils/common/queryable.interface";


export default interface ParentService {
	getUserParent: (parentId: number) => Promise<UserParent | null>;

	getCoursesForTimetableByParent: (studentId: number) => Promise<Course[] | null>;

	getPagecbleStudentCourses: (studentId: number, pageableDto: PageableDto, queryable: Queryable<Course>) => Promise<CourseListDto>;
}