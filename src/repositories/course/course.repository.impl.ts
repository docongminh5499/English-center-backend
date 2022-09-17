import { Pageable, Selectable, Sortable } from "..";
import { Course } from "../../entities/Course";
import Queryable from "../../utils/common/queryable.interface";
import CourseRepositoryInterface from "./course.repository.interface";

class CourseRepositoryImpl implements CourseRepositoryInterface {
    async countCourseByTeacher(queryable: Queryable<Course>, teacherId?: number): Promise<number> {
        let query = Course.createQueryBuilder();
        query = queryable.buildQuery(query);
        if (teacherId !== undefined)
            query = query.where("teacherWorker = :id", { id: teacherId });
        return query.getCount()
    }

    async findCourseByTeacher(pageable: Pageable, sortable: Sortable,
        selectable: Selectable, queryable: Queryable<Course>, teacherId?: number): Promise<Course[]> {
        let query = Course.createQueryBuilder();
        query = selectable.buildQuery(query);
        query = queryable.buildQuery(query);
        if (teacherId !== undefined)
            query = query.where("teacherWorker = :id", { id: teacherId });
        query = sortable.buildQuery(query);
        query = pageable.buildQuery(query);
        return query.execute()
    }
}

const CourseRepository = new CourseRepositoryImpl();
export default CourseRepository;