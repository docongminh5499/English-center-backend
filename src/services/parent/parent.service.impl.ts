import { CourseListDto, PageableDto } from "../../dto";
import { Course } from "../../entities/Course";
import { Exercise } from "../../entities/Exercise";
import { StudentDoExercise } from "../../entities/StudentDoExercise";
import { UserAttendStudySession } from "../../entities/UserAttendStudySession";
import { UserParent } from "../../entities/UserParent";
import { CourseRepository, Pageable, Selectable, Sortable } from "../../repositories";
import StudySessionRepository from "../../repositories/studySession/studySession.repository.impl";
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

    async getCourseDetail(studentId: number, courseSlug: string) : Promise<Course | null>{
        const course = await CourseRepository.findBriefCourseBySlug(courseSlug);
        if(course === null)
            return null;
        course?.studentPaticipateCourses.forEach(value => console.log(value.student.user.id))
        if (course?.studentPaticipateCourses.filter(value => value.student.user.id == studentId).length === 0) 
            return null;
        return course;
    }

    async getAttendance(studentId: number, courseSlug: string) : Promise<UserAttendStudySession[]>{
        console.log("STUDENT ATTENDANCE SERVICE");
        const attendance = await StudySessionRepository.findStudySessionByStudent(studentId, courseSlug);
        // console.log(attendance);
        return attendance!;
    }

    async getAllExercises(courseId: number) : Promise<Exercise[] | null>{
        try{
            console.log(courseId);
            const exercise = await Exercise.createQueryBuilder("exercise")
                                    .where("courseId = :courseId", {courseId: courseId})
                                    .getMany();
            return exercise;
        } catch(error){
            console.log(error);
            return null;
        }
    }

    async getStudentDoExercise(studentId: number, courseId: number) : Promise<StudentDoExercise[] | null>{
        try{
            const studentDoExercise = StudentDoExercise.createQueryBuilder("studentDoExercise")
                                                       .leftJoinAndSelect("studentDoExercise.student", "student")
                                                       .leftJoinAndSelect("student.user", "user")
                                                       .leftJoinAndSelect("studentDoExercise.exercise", "exercise")
                                                       .leftJoinAndSelect("exercise.course", "course")
                                                       .where("user.id = :studentId", {studentId})
                                                       .andWhere("course.id = :courseId", {courseId})
                                                       .getMany();
            return studentDoExercise;
        } catch(error){
            console.log(error);
            return null;
        }
    }
}

const ParentService = new ParentServiceImpl();
export default ParentService;
