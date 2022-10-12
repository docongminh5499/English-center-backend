import { Pageable, Selectable, Sortable } from "..";
import { Course } from "../../entities/Course";
import { StudentParticipateCourse } from "../../entities/StudentParticipateCourse";
import Queryable from "../../utils/common/queryable.interface";
import CourseRepositoryInterface from "./course.repository.interface";

class CourseRepositoryImpl implements CourseRepositoryInterface {
    async countCourseByTeacher(queryable: Queryable<Course>, teacherId?: number): Promise<number> {
        let query = Course.createQueryBuilder();
        query = queryable.buildQuery(query);
        if (teacherId !== undefined)
            query = query.andWhere("teacherWorker = :id", { id: teacherId });
        return query.getCount()
    }

    async findCourseByTeacher(pageable: Pageable, sortable: Sortable,
        selectable: Selectable, queryable: Queryable<Course>, teacherId?: number): Promise<Course[]> {
        let query = Course.createQueryBuilder();
        query = selectable.buildQuery(query);
        query = queryable.buildQuery(query);
        if (teacherId !== undefined)
            query = query.andWhere("teacherWorker = :id", { id: teacherId });
        query = sortable.buildQuery(query);
        query = pageable.buildQuery(query);
        return query.execute()
    }

    async findCourseForTimetableByStudent(studentId: number): Promise<Course[]> {
        const studentPaticipateCourse = await StudentParticipateCourse
            .createQueryBuilder("student_participate_course")
            .select("student_participate_course.course")
            .leftJoinAndSelect("student_participate_course.course", "course")
            .leftJoinAndSelect("course.schedules", "schedule")
            .leftJoinAndSelect("schedule.startShift", "startShift")
            .leftJoinAndSelect("schedule.endShift", "endShift")
            .leftJoinAndSelect("schedule.classroom", "classroom")
            .where("studentId = :id", { id: studentId })
            .getMany();
        // console.log(studentPaticipateCourse);
        const courses: Course[] = [];
        studentPaticipateCourse.forEach(async value => {
            courses.push(value.course);
        });
        return courses;
    }

    async findCourseBySlug(courseSlug: string): Promise<Course | null> {
        let result = Course.createQueryBuilder("course")
            .leftJoinAndSelect("course.documents", "documents")
            .leftJoinAndSelect("course.teacher", "teacher")
            .leftJoinAndSelect("teacher.worker", "worker")
            .leftJoinAndSelect("worker.user", "userTeacher")
            // .leftJoinAndSelect("course.studySessions", "studySessions")
            .leftJoinAndSelect("course.exercises", "exercises")
            .leftJoinAndSelect("course.curriculum", "curriculum")
            .leftJoinAndSelect("curriculum.lectures", "lectures")
            .leftJoinAndSelect("course.studentPaticipateCourses", "studentPaticipateCourses")
            .leftJoinAndSelect("studentPaticipateCourses.student", "student")
            .leftJoinAndSelect("student.user", "userStudent")
            .where("course.slug = :courseSlug", { courseSlug })
            .orderBy({
                "lectures.order": "ASC",
                "-exercises.openTime": "ASC",
                "studentPaticipateCourses.commentDate": "DESC",
                "documents.name": "ASC",
            })
            .getOne();
        return result;
    }

    async findBriefCourseBySlug(courseSlug: string): Promise<Course | null> {
        let result = Course.createQueryBuilder("course")
            .leftJoinAndSelect("course.documents", "documents")
            .leftJoinAndSelect("course.teacher", "teacher")
            .leftJoinAndSelect("teacher.worker", "worker")
            .leftJoinAndSelect("worker.user", "userTeacher")
            // .leftJoinAndSelect("course.studySessions", "studySessions")
            .leftJoinAndSelect("course.exercises", "exercises")
            // .leftJoinAndSelect("course.curriculum", "curriculum")
            // .leftJoinAndSelect("curriculum.lectures", "lectures")
            .leftJoinAndSelect("course.studentPaticipateCourses", "studentPaticipateCourses")
            .leftJoinAndSelect("studentPaticipateCourses.student", "student")
            .leftJoinAndSelect("student.user", "userStudent")
            .where("course.slug = :courseSlug", { courseSlug })
            .getOne();
        return result;
    }


    async countCourseByStudent(queryable: Queryable<Course>, studentId?: number): Promise<number> {
        console.log("Count Student Repo");
        let query = Course.createQueryBuilder();
        query = queryable.buildQuery(query);
        if (studentId !== undefined)
            query = query.andWhere("student_participate_course.studentId = :id", { id: studentId });
        return query.getCount()
    }

    async findCourseByStudent(pageable: Pageable, sortable: Sortable,
        selectable: Selectable, queryable: Queryable<Course>, studentId?: number): Promise<Course[]> {
        console.log("Find Student Repo");
        let query = Course.createQueryBuilder();
        query = selectable.buildQuery(query);
        query = queryable.buildQuery(query);
        if (studentId !== undefined)
            query = query.andWhere("student_participate_course.studentId = :id", { id: studentId });
        query = sortable.buildQuery(query);
        query = pageable.buildQuery(query);
        return query.execute()
    }


    async findCourseById(courseId: number): Promise<Course | null> {
        let result = Course.createQueryBuilder("course")
            .leftJoinAndSelect("course.teacher", "teacher")
            .leftJoinAndSelect("teacher.worker", "worker")
            .leftJoinAndSelect("worker.user", "userTeacher")
            .leftJoinAndSelect("course.studentPaticipateCourses", "studentPaticipateCourses")
            .leftJoinAndSelect("studentPaticipateCourses.student", "student")
            .leftJoinAndSelect("student.user", "userStudent")
            .leftJoinAndSelect("userStudent.socketStatuses", "socketStatuses")
            .where("course.id = :courseId", { courseId })
            .getOne();
        return result;
    }


    async countByCurriculumId(curriculumId: number): Promise<number> {
        return await Course.createQueryBuilder("course")
            .leftJoinAndSelect("course.curriculum", "curriculum")
            .where("curriculum.id = :curriculumId", { curriculumId })
            .getCount();
    }
}

const CourseRepository = new CourseRepositoryImpl();
export default CourseRepository;