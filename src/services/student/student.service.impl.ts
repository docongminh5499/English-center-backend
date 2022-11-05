import { CourseListDto, PageableDto } from "../../dto";
import { Course } from "../../entities/Course";
import { Exercise } from "../../entities/Exercise";
import { StudentDoExercise } from "../../entities/StudentDoExercise";
import { StudentParticipateCourse } from "../../entities/StudentParticipateCourse";
import { UserAttendStudySession } from "../../entities/UserAttendStudySession";
import { CourseRepository, Pageable, Selectable, Sortable } from "../../repositories";
import ExerciseRepository from "../../repositories/exercise/exercise.repository.impl";
import StudySessionRepository from "../../repositories/studySession/studySession.repository.impl";
import UserStudentRepository from "../../repositories/userStudent/userStudent.repository.impl";
import Queryable from "../../utils/common/queryable.interface";
import StudentServiceInterface from "./student.service.interface";

class StudentServiceImpl implements StudentServiceInterface {
    async getCoursesForTimetableByStudent(studentId: number) : Promise<Course[]>{
        const studentCourse = await CourseRepository.findCourseForTimetableByStudent(studentId);
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
        
        const courseListDto = new CourseListDto();
        courseListDto.courses = courseList;
        courseListDto.limit = pageable.limit;
        courseListDto.skip = pageable.offset;
        courseListDto.total = courseCount;

        return courseListDto;
    }

    async getCourseDetail(studentId: number, courseSlug: string): Promise<Partial<Course> | null> {
        const course = await CourseRepository.findBriefCourseBySlug(courseSlug);
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
        // console.log(studentParticipateCourse);
        await StudentParticipateCourse.createQueryBuilder()
                                      .update()
                                      .set(studentParticipateCourse)
                                      .where("studentId = :studentId", {studentId: studentId})
                                      .andWhere("courseId = :courseId", {courseId: courseId})
                                      .execute();
        
        return true;
    }

    async getAttendance(studentId: number, courseSlug: string): Promise<UserAttendStudySession[]>{
        console.log("STUDENT ATTENDANCE SERVICE");
        const attendance = await StudySessionRepository.findStudySessionByStudent(studentId, courseSlug);
        // console.log(attendance);
        return attendance!;
    }

    async getAllExercises(courseId: number) : Promise<Exercise[] | null>{
        try{
            console.log(courseId);
            const exercise = await Exercise.createQueryBuilder("exercise")
                                    .leftJoinAndSelect("exercise.questions", "questions")
                                    .leftJoinAndSelect("questions.wrongAnswers", "wrongAnswers")
                                    .leftJoinAndSelect("questions.tags", "tags")
                                    .where("courseId = :courseId", {courseId: courseId})
                                    .getMany();
            return exercise;
        } catch(error){
            console.log(error);
            return null;
        }
    }

    async submitExercise(studentId: number, exerciseId: number, answers: any[]) : Promise<StudentDoExercise | null>{
        try{
            const student = await UserStudentRepository.findUserStudentById(studentId);
            const exercise = await ExerciseRepository.findExerciseById(exerciseId);
            if(student === null || exercise === null){
                return null;
            }
            let rightAnswer = 0;
            answers.forEach((answer: any) => {
                if(answer.questionId === parseInt(answer.answerId)){
                    rightAnswer++;
                }
            })
            const studentDoExercise = new StudentDoExercise();
            studentDoExercise.student = student;
            studentDoExercise.exercise = exercise;
            studentDoExercise.score = rightAnswer/ answers.length * 10;
            await StudentDoExercise.save(studentDoExercise);
            return studentDoExercise;
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

const StudentService = new StudentServiceImpl();
export default StudentService;