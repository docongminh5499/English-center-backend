import { CourseListDto, PageableDto } from "../../dto";

export default interface TeacherService {
    getCoursesByTeacher: (teacherId: number, pageable: PageableDto) => Promise<CourseListDto>;
}