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

    async findCourseByStudent(studentId: number) : Promise<Course[]>{
        const studentPaticipateCourse = await StudentParticipateCourse
            .createQueryBuilder("student_participate_course")
            .leftJoinAndSelect("student_participate_course.course", "course")
            .leftJoinAndSelect("course.schedules", "schedule")
            .leftJoinAndSelect("schedule.startShift", "startShift")
            .leftJoinAndSelect("schedule.endShift", "endShift")
            .leftJoinAndSelect("schedule.classroom", "classroom")
            .where("studentId = :id", {id: studentId})
            .getMany();
        const courses: Course[] = [];
        studentPaticipateCourse.forEach(async value => {
            courses.push(value.course);
        });
        return courses;
    }
}

const CourseRepository = new CourseRepositoryImpl();
export default CourseRepository;