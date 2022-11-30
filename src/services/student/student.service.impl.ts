import { CourseListDto, PageableDto } from "../../dto";
import { Course } from "../../entities/Course";
import { Document } from "../../entities/Document";
import { Exercise } from "../../entities/Exercise";
import { MakeUpLession } from "../../entities/MakeUpLession";
import { StudentDoExercise } from "../../entities/StudentDoExercise";
import { StudentParticipateCourse } from "../../entities/StudentParticipateCourse";
import { StudySession } from "../../entities/StudySession";
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
        const course = await Course.createQueryBuilder("course")
                                .setLock("pessimistic_read")
                                .useTransaction(true)
                                .where("course.id = :courseId", { courseId })
                                .getOne();

        if (course === null)
            return false;

        const expectedClosingDate = new Date(course.expectedClosingDate);
        const now = new Date();
        if(!(Math.abs(expectedClosingDate.getTime() - now.getTime()) < 14 * 24 * 60 * 60 * 1000)){
            return false;
        }

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
                                    .setLock("pessimistic_read")
                                    .useTransaction(true)
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
                                                       .setLock("pessimistic_read")
                                                       .useTransaction(true)
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

    async getDocument(courseId: number) : Promise<Document[] | null>{
        try{
            const course = CourseRepository.findCourseById(courseId);
            if (course === null) {
                throw new Error("Khóa học không tồn tại.");
            }
            const document = Document.createQueryBuilder("document")
                                     .where("courseId =:id", {id: courseId})
                                     .getMany();
        
            return document;
        }catch (error){
            console.log(error);
            return null
        }
        return null;
    }

    async getMakeupLessionCompatible(curriculumId: number, branchId: number, order: number, courseId: number) : Promise<StudySession[] | null>{
        const courses = await Course
                        .createQueryBuilder("course")
                        .setLock("pessimistic_read")
                        .useTransaction(true)
                        .leftJoinAndSelect("course.curriculum", "curriculum")
                        .leftJoinAndSelect("course.branch", "branch")
                        .where("curriculum.id = :curriculumId", {curriculumId: curriculumId})
                        .andWhere("branch.id = :branchId", {branchId: branchId})
                        .andWhere("course.id != :courseId", {courseId: courseId})
                        .getMany();
        console.log(courses);
        const studySession:StudySession[] = [];
        for(const course of courses){
            console.log(course.id);
            const compatibleStudySession = await StudySession
                                            .createQueryBuilder("studySession")
                                            .setLock("pessimistic_read")
                                            .useTransaction(true)
                                            .leftJoinAndSelect("studySession.course", "course")
                                            .leftJoinAndSelect("studySession.shifts", "shifts")
                                            .leftJoinAndSelect("studySession.classroom", "classroom")
                                            .where("course.id = :cid", {cid: course.id})
                                            // .andWhere("course.closingDate IS NULL")
                                            .orderBy({
                                                "studySession.date": "ASC",
                                                "shifts.startTime": "ASC",
                                            })
                                            .skip(order) 
                                            .take(1)
                                            .getOne();
                        
            if (compatibleStudySession !== null)
                studySession.push(compatibleStudySession);
        }
        console.log(studySession);
        return studySession.length === 0 ? null : studySession;
    }

    async registerMakeupLession(studentId: number, studySessionId: number, targetStudySessionId: number) : Promise<MakeUpLession | null>{
        const studySession = await StudySession
                                .createQueryBuilder("studySession")
                                .setLock("pessimistic_read")
                                .useTransaction(true)
                                .where("studySession.id = :studySessionId", {studySessionId: studySessionId})
                                .getOne();

        const targetStudySession = await StudySession
                                .createQueryBuilder("ss")
                                .setLock("pessimistic_read")
                                .useTransaction(true)
                                .leftJoinAndSelect("ss.course", "course")
                                .leftJoinAndSelect("ss.shifts", "shifts")
                                .leftJoinAndSelect("ss.classroom", "classroom")
                                .where("ss.id = :ssid", {ssid: targetStudySessionId})
                                .getOne();

        const userStudent = await UserStudentRepository.findStudentById(studentId);

        if (studySession === null || targetStudySession === null || userStudent === null){
            return null;
        }
        
        const makeupLession = new MakeUpLession();
        makeupLession.student = userStudent;
        makeupLession.studySession = studySession;
        makeupLession.targetStudySession = targetStudySession;
        makeupLession.commentOfTeacher = "";
        makeupLession.isAttend = true;

        await MakeUpLession.save(makeupLession);

        const savedMakeupLession = await MakeUpLession
                                            .createQueryBuilder("makeupLession")
                                            .setLock("pessimistic_read")
                                            .useTransaction(true)
                                            .leftJoinAndSelect("makeupLession.student", "student")
                                            .leftJoinAndSelect("student.user", "user")
                                            // .leftJoinAndSelect("makeupLession.studySession", "studySession")
                                            .leftJoinAndSelect("makeupLession.targetStudySession", "targetStudySession")
                                            .leftJoinAndSelect("targetStudySession.course", "course")
                                            .leftJoinAndSelect("targetStudySession.shifts", "shifts")
                                            .leftJoinAndSelect("targetStudySession.classroom", "classroom")
                                            .where("user.id = :studentId", {studentId})
                                            // .andWhere("studySession.id = :studySessionId", {studySessionId})
                                            .andWhere("targetStudySession.id = :targetStudySessionId", {targetStudySessionId})
                                            .getOne();
        console.log(savedMakeupLession);

        return savedMakeupLession;
    }

    async getMakeupLession(studentId: number) : Promise<MakeUpLession[] | null>{
        if (studentId === undefined)
            return null;
        //TODO: Uncomment when deploy
        const makeupLession = await MakeUpLession
                                    .createQueryBuilder("makeupLession")
                                    .setLock("pessimistic_read")
                                    .useTransaction(true)
                                    .leftJoinAndSelect("makeupLession.student", "student")
                                    .leftJoinAndSelect("student.user", "user")
                                    .leftJoinAndSelect("makeupLession.targetStudySession", "targetStudySession")
                                    .leftJoinAndSelect("targetStudySession.course", "course")
                                    .leftJoinAndSelect("targetStudySession.shifts", "shifts")
                                    .leftJoinAndSelect("targetStudySession.classroom", "classroom")
                                    .where("user.id = :studentId", {studentId})
                                    // .andWhere("targetStudySession.date > :now", {now: new Date()})
                                    .orderBy({
                                        "targetStudySession.date": "ASC",
                                        "shifts.startTime": "ASC",
                                    }).getMany();

        return makeupLession;
    }

    async deleteMakeupLession(studentId: number, studySessionId: number, targetStudySessionId: number) : Promise<boolean>{
        if(!studentId || !studySessionId || !targetStudySessionId)
            return false;
        
        await MakeUpLession
                .createQueryBuilder("makeupLession")
                .setLock("pessimistic_read")
                .useTransaction(true)
                .leftJoinAndSelect("makeupLession.student", "student")
                .leftJoinAndSelect("student.user", "user")
                .leftJoinAndSelect("makeupLession.studySession", "studySession")
                .leftJoinAndSelect("makeupLession.targetStudySession", "targetStudySession")
                .delete()
                .where("user.id = :studentId", {studentId})
                .andWhere("studySession.id = :studySessionId", {studySessionId})
                .andWhere("targetStudySession.id = :targetStudySessionId", {targetStudySessionId})
                .execute();

        // console.log(makeupLession);

        return true;
    }
}

const StudentService = new StudentServiceImpl();
export default StudentService;