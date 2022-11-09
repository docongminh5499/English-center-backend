import { CourseListDto, PageableDto } from "../../dto";
import { Course } from "../../entities/Course";
import { UserParent } from "../../entities/UserParent";
import { CourseRepository, Pageable, Selectable, Sortable } from "../../repositories";
import UserParentRepository from "../../repositories/userParent/userParent.repository.impl";
import Queryable from "../../utils/common/queryable.interface";
import { NotFoundError } from "../../utils/errors/notFound.error";
import ParentServiceInterface from "./parent.service.interface";

class ParentServiceImpl implements ParentServiceInterface {
	async getUserParent(parentId: number) : Promise<UserParent | null>{
		if (parentId === null || parentId === undefined)
			throw new NotFoundError();

		const userParent = await UserParentRepository.findUserParent(parentId);

		return userParent;
	}

	async getCoursesForTimetableByParent(studentId: number) : Promise<Course[] | null>{
		if(studentId === null || studentId === undefined)
			throw new NotFoundError();
		const courses = await CourseRepository.findCourseForTimetableByStudent(studentId);
		return courses;
	}

	async getPagecbleStudentCourses(studentId: number, pageableDto: PageableDto, queryable: Queryable<Course>) : Promise<CourseListDto>{
		console.log("STUDENT SERVICE");
        const selectable = new Selectable()
            .add("Course.id", "id")
            .add("Course.image", "image")
            .add("Course.closingDate", "closingDate")
            .add("Course.name", "name")
            .add("Course.openingDate", "openingDate")
            .add("Course.expectedClosingDate", "expectedClosingDate")
            .add("slug", "slug");
        const sortable = new Sortable()
            .add("openingDate", "DESC")
            .add("name", "ASC");
        const pageable = new Pageable(pageableDto);

        const [courseCount, courseList] = await Promise.all([
            CourseRepository.countCourseByStudent(queryable, studentId),
            CourseRepository.findCourseByStudent(pageable, sortable, selectable, queryable, studentId)
        ]);
        
        const courseListDto = new CourseListDto();
        courseListDto.courses = courseList;
        courseListDto.limit = pageable.limit;
        courseListDto.skip = pageable.offset;
        courseListDto.total = courseCount;

        return courseListDto;
	}
}

const ParentService = new ParentServiceImpl();
export default ParentService;
