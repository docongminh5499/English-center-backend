import { CourseListDto, PageableDto } from "../../dto";
import { Course } from "../../entities/Course";
import { StudentParticipateCourse } from "../../entities/StudentParticipateCourse";
import { CourseRepository, Pageable, Selectable, Sortable, UserRepository } from "../../repositories";
import Queryable from "../../utils/common/queryable.interface";
import StudentServiceInterface from "./student.service.interface";

class StudentServiceImpl implements StudentServiceInterface {
    async getCoursesForTimetableByUsername(username: string) : Promise<Course[]>{
        const user = await UserRepository.findUserByUsername(username);
        const studentCourse = await CourseRepository.findCourseForTimetableByStudent(user.id);
        return studentCourse;
    }

    async getCoursesByStudent(studentId: number, pageableDto: PageableDto, queryable: Queryable<Course>): Promise<CourseListDto> {
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
        
        console.log(courseCount);
        console.log(courseList);
        
        const courseListDto = new CourseListDto();
        courseListDto.courses = courseList;
        courseListDto.limit = pageable.limit;
        courseListDto.skip = pageable.offset;
        courseListDto.total = courseCount;

        return courseListDto;
    }

    async getCourseDetail(studentId: number, courseSlug: string): Promise<Partial<Course> | null> {
        const course = await CourseRepository.findCourseBySlug(courseSlug);
        // console.log(course?.studentPaticipateCourses)
        course?.studentPaticipateCourses.forEach(value => console.log(value.student.user.id))
        if (course?.studentPaticipateCourses.filter(value => value.student.user.id === studentId).length === 0) 
            return null;
        return course;
    }

    async assessCourse(studentId: number, courseId: number, content: any): Promise<boolean>{
        console.log("ASSESS COURSE SERVICE");
        const studentParticipateCourse = await StudentParticipateCourse.createQueryBuilder()
                                                                       .select()
                                                                       .where("studentId = :studentId", {studentId: studentId})
                                                                       .andWhere("courseId = :courseId", {courseId: courseId})
                                                                       .getOne();
        if (studentParticipateCourse == null)
            return false;
        studentParticipateCourse!.starPoint = content.starPoint;
        studentParticipateCourse!.comment = content.comment;
        studentParticipateCourse!.isIncognito = content.isIncognito;
        studentParticipateCourse!.commentDate = new Date();
        console.log(studentParticipateCourse);
        await StudentParticipateCourse.createQueryBuilder()
                                      .update()
                                      .set(studentParticipateCourse)
                                      .where("studentId = :studentId", {studentId: studentId})
                                      .andWhere("courseId = :courseId", {courseId: courseId})
                                      .execute();
        
        return true;
    }
}

const StudentService = new StudentServiceImpl();
export default StudentService;