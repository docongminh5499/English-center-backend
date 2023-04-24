import moment = require("moment");
import { Pageable, Selectable, Sortable } from "..";
import { Course } from "../../entities/Course";
import { Lecture } from "../../entities/Lecture";
import { StudySession } from "../../entities/StudySession";
import Queryable from "../../utils/common/queryable.interface";
import { CurriculumLevel } from "../../utils/constants/curriculum.constant";
import CourseRepositoryInterface from "./course.repository.interface";

class CourseRepositoryImpl implements CourseRepositoryInterface {
    async countCourseByTeacher(queryable: Queryable<Course>, teacherId: number): Promise<number> {
        let query = Course.createQueryBuilder()
            .setLock("pessimistic_read")
            .useTransaction(true);
        query = queryable.buildQuery(query);
        query = query.andWhere((qb: any) => {
            const subQuery = qb
                .subQuery()
                .select("ss.courseId")
                .distinct(true)
                .from(StudySession, "ss")
                .where("teacherWorker = :id")
                .getQuery()
            return "Course.id IN " + subQuery
        }).andWhere("Course.lockTime IS NULL").setParameter("id", teacherId);
        return query.getCount()
    }

    async findCourseByTeacher(pageable: Pageable, sortable: Sortable, queryable: Queryable<Course>, teacherId: number): Promise<Course[]> {
        let query = Course.createQueryBuilder()
            .setLock("pessimistic_read")
            .useTransaction(true);
        query = queryable.buildQuery(query);
        query = query
            .leftJoinAndSelect("Course.teacher", "teacher")
            .leftJoinAndSelect("teacher.worker", "worker")
            .leftJoinAndSelect("worker.user", "userTeacher")
            .andWhere("Course.lockTime IS NULL")
            .andWhere((qb: any) => {
                const subQuery = qb
                    .subQuery()
                    .select("ss.courseId")
                    .distinct(true)
                    .from(StudySession, "ss")
                    .where("teacherWorker = :id")
                    .getQuery()
                return "Course.id IN " + subQuery
            }).setParameter("id", teacherId);
        query = sortable.buildQuery(query);
        query = pageable.buildQuery(query);
        return query.getMany()
    }

    async findCourseForTimetableByStudent(studentId: number): Promise<Course[]> {
        const studentCourses = await Course.createQueryBuilder("course")
            .setLock("pessimistic_read")
            .useTransaction(true)
            .leftJoinAndSelect("course.curriculum", "curriculum")
            .leftJoinAndSelect("course.branch", "branch")
            .leftJoinAndSelect("course.studentPaticipateCourses", "studentPaticipateCourses")
            .leftJoinAndSelect("studentPaticipateCourses.student", "userStudent")
            .innerJoinAndSelect("userStudent.user", "user", "user.id = :studentId", { studentId: studentId })
            .leftJoinAndSelect("course.studySessions", "studySessions")
            .leftJoinAndSelect("studySessions.shifts", "shifts")
            .leftJoinAndSelect("studySessions.classroom", "classroom")
            .where("course.closingDate IS NULL", { date: moment().utc().format("YYYY-MM-DD hh:mm:ss") })
            .andWhere("course.lockTime IS NULL OR course.lockTime > :now", {now: new Date()})
            .orderBy({
                "course.openingDate": "ASC",
                "studySessions.date": "ASC",
                "shifts.startTime": "ASC",
            })
            .getMany();
        // console.log(studentCourses);
        return studentCourses;
    }

    async findCourseBySlug(courseSlug: string): Promise<Course | null> {
        let result = Course.createQueryBuilder("course")
            .setLock("pessimistic_read")
            .useTransaction(true)
            .leftJoinAndSelect("course.branch", "branch")
            .leftJoinAndSelect("course.teacher", "teacher")
            .leftJoinAndSelect("teacher.worker", "worker")
            .leftJoinAndSelect("worker.user", "userTeacher")
            .leftJoinAndSelect("course.curriculum", "curriculum")
            .leftJoinAndSelect("curriculum.lectures", "lectures")
            .where("course.slug = :courseSlug", { courseSlug })
            .orderBy({ "lectures.order": "ASC" })
            .getOne();
        return result;
    }

    async findBriefCourseBySlug(courseSlug: string): Promise<Course | null> {
        let result = Course.createQueryBuilder("course")
            .setLock("pessimistic_read")
            .useTransaction(true)
            .leftJoinAndSelect("course.documents", "documents")
            .leftJoinAndSelect("course.teacher", "teacher")
            .leftJoinAndSelect("teacher.worker", "worker")
            .leftJoinAndSelect("worker.user", "userTeacher")
            .leftJoinAndSelect("course.exercises", "exercises")
            .leftJoinAndSelect("course.studentPaticipateCourses", "studentPaticipateCourses")
            .leftJoinAndSelect("studentPaticipateCourses.student", "student")
            .leftJoinAndSelect("student.user", "userStudent")
            .where("course.slug = :courseSlug", { courseSlug })
            .andWhere("course.lockTime IS NULL OR course.lockTime > :now", {now: new Date()})
            .getOne();
        return result;
    }


    async countCourseByStudent(queryable: Queryable<Course>, studentId?: number): Promise<number> {
        // console.log("Count Student Repo");
        let query = Course.createQueryBuilder()
            .setLock("pessimistic_read")
            .useTransaction(true);
        query = queryable.buildQuery(query);
        if (studentId !== undefined)
            query = query.andWhere("student_participate_course.studentId = :id", { id: studentId });
        return query.getCount()
    }

    async findCourseByStudent(pageable: Pageable, sortable: Sortable,
        selectable: Selectable, queryable: Queryable<Course>, studentId?: number): Promise<Course[]> {
        // console.log("Find Student Repo");
        let query = Course.createQueryBuilder()
            .setLock("pessimistic_read")
            .useTransaction(true);
        query = selectable.buildQuery(query);
        query = queryable.buildQuery(query);
        if (studentId !== undefined)
            query = query.andWhere("student_participate_course.studentId = :id", { id: studentId })
                        .andWhere("Course.lockTime IS NULL OR Course.lockTime > :now", {now: new Date()});
        query = sortable.buildQuery(query);
        query = pageable.buildQuery(query);
        return query.execute()
    }


    async findCourseById(courseId: number): Promise<Course | null> {
        let result = Course.createQueryBuilder("course")
            .setLock("pessimistic_read")
            .useTransaction(true)
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
            .setLock("pessimistic_read")
            .useTransaction(true)
            .leftJoinAndSelect("course.curriculum", "curriculum")
            .where("curriculum.id = :curriculumId", { curriculumId })
            .getCount();
    }


    async findCourseByBranch(pageable: Pageable, sortable: Sortable,
        selectable: Selectable, queryable: Queryable<Course>, branchId?: number): Promise<Course[]> {
        let query = Course.createQueryBuilder()
            .setLock("pessimistic_read")
            .useTransaction(true);
        query = selectable.buildQuery(query);
        query = queryable.buildQuery(query);
        if (branchId !== undefined)
            query = query
                .leftJoinAndSelect('Course.branch', 'branch')
                .andWhere("branch.id = :id", { id: branchId });
        query = sortable.buildQuery(query);
        query = pageable.buildQuery(query);
        return query.execute()
    }


    async countCourseByBranch(queryable: Queryable<Course>, branchId?: number): Promise<number> {
        let query = Course.createQueryBuilder()
            .setLock("pessimistic_read")
            .useTransaction(true);
        query = queryable.buildQuery(query);
        if (branchId !== undefined)
            query = query
                .leftJoinAndSelect('Course.branch', 'branch')
                .andWhere("branch.id = :id", { id: branchId });
        return query.getCount()
    }


    async countCourseByTutor(queryable: Queryable<Course>, tutorId: number): Promise<number> {
        let query = Course.createQueryBuilder()
            .setLock("pessimistic_read")
            .useTransaction(true);
        query = queryable.buildQuery(query);
        query = query.andWhere((qb: any) => {
            const subQuery = qb
                .subQuery()
                .select("ss.courseId")
                .distinct(true)
                .from(StudySession, "ss")
                .where("tutorWorker = :id")
                .getQuery()
            return "Course.id IN " + subQuery
        }).andWhere("Course.lockTime IS NULL").setParameter("id", tutorId);
        return query.getCount()
    }


    async findCourseByTutor(pageable: Pageable, sortable: Sortable, queryable: Queryable<Course>, tutorId: number): Promise<Course[]> {
        let query = Course.createQueryBuilder()
            .setLock("pessimistic_read")
            .useTransaction(true);
        query = queryable.buildQuery(query);
        query = query
            .leftJoinAndSelect("Course.teacher", "teacher")
            .leftJoinAndSelect("teacher.worker", "worker")
            .leftJoinAndSelect("worker.user", "userTeacher")
            .andWhere("Course.lockTime IS NULL")
            .andWhere((qb: any) => {
                const subQuery = qb
                    .subQuery()
                    .select("ss.courseId")
                    .distinct(true)
                    .from(StudySession, "ss")
                    .where("tutorWorker = :id")
                    .getQuery()
                return "Course.id IN " + subQuery
            }).setParameter("id", tutorId);
        query = sortable.buildQuery(query);
        query = pageable.buildQuery(query);
        return query.getMany()
    }


    async countCompletedCourse(): Promise<number> {
        return await Course.createQueryBuilder("c")
            .setLock("pessimistic_read")
            .useTransaction(true)
            .where("c.lockTime IS NULL")
            .andWhere("c.closingDate IS NOT NULL")
            .getCount();

    }


    async getCoursesForGuest(pageable: Pageable, level?: CurriculumLevel, curriculumTag?: string, branchId?: number): Promise<Course[]> {
        let query = Course.createQueryBuilder("c")
            .leftJoinAndSelect("c.teacher", "teacher")
            .leftJoinAndSelect("teacher.worker", "worker")
            .leftJoinAndSelect("worker.user", "user")
            .leftJoinAndSelect("c.curriculum", "curriculum")
            .leftJoinAndSelect("c.branch", "branch")
            .where("c.openingDate > CURDATE()")
            .andWhere("c.lockTime IS NULL")
            .orderBy("c.openingDate", "DESC");
        if (level !== undefined && level !== null)
            query = query.andWhere("curriculum.level = :level", { level })
        if (curriculumTag !== undefined && curriculumTag !== null)
            query = query.andWhere((qb) => {
                const subQuery = qb
                    .subQuery()
                    .select("course.id")
                    .distinct(true)
                    .from(Course, "course")
                    .leftJoin("course.curriculum", "curriculum")
                    .leftJoin("curriculum.tags", "tags")
                    .where("tags.name = :curriculumTag")
                    .getQuery()
                return "c.id IN " + subQuery
            }).setParameter("curriculumTag", curriculumTag);
        if (branchId !== undefined && branchId !== null)
            query = query.andWhere("branch.id = :branchId", { branchId });
        query = pageable.buildQuery(query);
        const result: Course[] = await query.getMany();
        for (const course of result)
            course.curriculum.lectures = await Lecture.createQueryBuilder("l")
                .where("l.curriculumId = :curriculumId", { curriculumId: course.curriculum.id })
                .getMany();
        return result;
    }



    async countCoursesForGuest(level?: CurriculumLevel, curriculumTag?: string, branchId?: number): Promise<number> {
        let query = Course.createQueryBuilder("c")
            .leftJoinAndSelect("c.curriculum", "curriculum")
            .leftJoinAndSelect("c.branch", "branch")
            .where("c.openingDate > CURDATE()")
            .andWhere("c.lockTime IS NULL");
        if (level !== undefined && level !== null)
            query = query.andWhere("curriculum.level = :level", { level })
        if (curriculumTag !== undefined && curriculumTag !== null)
            query = query.andWhere((qb) => {
                const subQuery = qb
                    .subQuery()
                    .select("course.id")
                    .distinct(true)
                    .from(Course, "course")
                    .leftJoin("course.curriculum", "curriculum")
                    .leftJoin("curriculum.tags", "tags")
                    .where("tags.name = :curriculumTag")
                    .getQuery()
                return "c.id IN " + subQuery
            }).setParameter("curriculumTag", curriculumTag);
        if (branchId !== undefined && branchId !== null)
            query = query.andWhere("branch.id = :branchId", { branchId });
        return await query.getCount();
    }


    async getCourseDetailForGuest(courseSlug: string): Promise<Course | null> {
        let result = Course.createQueryBuilder("course")
            .setLock("pessimistic_read")
            .useTransaction(true)
            .leftJoinAndSelect("course.branch", "branch")
            .leftJoinAndSelect("course.teacher", "teacher")
            .leftJoinAndSelect("teacher.worker", "worker")
            .leftJoinAndSelect("worker.user", "userTeacher")
            .leftJoinAndSelect("course.curriculum", "curriculum")
            .leftJoinAndSelect("curriculum.lectures", "lectures")
            .leftJoinAndSelect("curriculum.tags", "tags")
            .leftJoinAndSelect("course.studySessions", "studySessions")
            .leftJoinAndSelect("studySessions.shifts", "shifts")
            .where("course.slug = :courseSlug", { courseSlug })
            .andWhere("course.closingDate IS NULL")
            .andWhere("course.openingDate > CURDATE()")
            .andWhere("course.lockTime IS NULL")
            .orderBy({
                "lectures.order": "ASC",
                "studySessions.date": "ASC"
            })
            .getOne();
        return await result;
    }
}

const CourseRepository = new CourseRepositoryImpl();
export default CourseRepository;