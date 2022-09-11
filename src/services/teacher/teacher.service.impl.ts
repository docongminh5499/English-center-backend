import { PageableDto, CourseListDto } from "../../dto";
import { CourseRepository } from "../../repositories";
import TeacherServiceInterface from "./teacher.service.interface";

class TeacherServiceImpl implements TeacherServiceInterface {
    async getCoursesByTeacher(teacherId: number, pageable: PageableDto): Promise<CourseListDto> {
        const [courseCount, courseList] = await Promise.all([
            CourseRepository.countCourseByTeacher(teacherId),
            CourseRepository.findCourseByTeacher(
                teacherId,
                pageable.limit,
                pageable.skip,
                ["id AS id", "image AS image"])
        ]);

        const courseListDto = new CourseListDto();
        courseListDto.courses = courseList;
        courseListDto.limit = pageable.limit;
        courseListDto.skip = pageable.skip;
        courseListDto.total = courseCount;

        return courseListDto;
    }

}

const TeacherService = new TeacherServiceImpl();
export default TeacherService;