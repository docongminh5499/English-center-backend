import { PageableDto, CourseListDto } from "../../dto";
import { Course } from "../../entities/Course";
import { CourseRepository, Pageable, Selectable, Sortable } from "../../repositories";
import Queryable from "../../utils/common/queryable.interface";
import TeacherServiceInterface from "./teacher.service.interface";

class TeacherServiceImpl implements TeacherServiceInterface {
    async getCoursesByTeacher(teacherId: number, pageableDto: PageableDto, queryable: Queryable<Course>): Promise<CourseListDto> {
        const selectable = new Selectable()
            .add("id", "id")
            .add("image", "image")
            .add("closingDate", "closingDate")
            .add("name", "name")
            .add("openingDate", "openingDate");
        const sortable = new Sortable()
            .add("openingDate", "DESC")
            .add("name", "ASC");
        const pageable = new Pageable(pageableDto);

        const [courseCount, courseList] = await Promise.all([
            CourseRepository.countCourseByTeacher(queryable, teacherId),
            CourseRepository.findCourseByTeacher(pageable, sortable, selectable, queryable, teacherId)
        ]);

        const courseListDto = new CourseListDto();
        courseListDto.courses = courseList;
        courseListDto.limit = pageable.limit;
        courseListDto.skip = pageable.offset;
        courseListDto.total = courseCount;

        return courseListDto;
    }

}

const TeacherService = new TeacherServiceImpl();
export default TeacherService;