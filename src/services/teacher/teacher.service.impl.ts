import { PageableDto, CourseListDto } from "../../dto";
import { Course } from "../../entities/Course";
import { CourseRepository, Pageable, Selectable, Sortable } from "../../repositories";
import ExerciseRepository from "../../repositories/exercise/exercise.repository.impl";
import Queryable from "../../utils/common/queryable.interface";
import TeacherServiceInterface from "./teacher.service.interface";

class TeacherServiceImpl implements TeacherServiceInterface {
    async getCoursesByTeacher(teacherId: number, pageableDto: PageableDto, queryable: Queryable<Course>): Promise<CourseListDto> {
        const selectable = new Selectable()
            .add("Course.id", "id")
            .add("Course.image", "image")
            .add("closingDate", "closingDate")
            .add("Course.name", "name")
            .add("openingDate", "openingDate")
            .add("slug", "slug");
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


    async getCourseDetail(teacherId: number, courseSlug: string): Promise<Partial<Course> | null> {
        const course = await CourseRepository.findCourseBySlug(courseSlug);
        if (course?.teacher.worker.user.id !== teacherId) 
            return null;
        return course;
    }


    async deleteExercise(teacherId: number, exerciseId: number) : Promise<boolean> {
        // const exercise = await ExerciseRepository.findExerciseById(exerciseId);
        // if (exercise)
        const result = await ExerciseRepository.deleteExercise(exerciseId);
        return result;
    }
}

const TeacherService = new TeacherServiceImpl();
export default TeacherService;