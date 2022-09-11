import { Course } from "../../entities/Course";
import CourseRepositoryInterface from "./course.repository.interface";

class CourseRepositoryImpl implements CourseRepositoryInterface {
    async countCourseByTeacher(teacherId?: number): Promise<number> {
        let query = Course.createQueryBuilder();
        if (teacherId !== undefined)
            query = query.where("teacherWorker = :id", { id: teacherId });
        return query.getCount()
    }

    async findCourseByTeacher(teacherId?: number, limit?: number,
        offset?: number, selectField?: string[] | undefined): Promise<Course[]> {
        let query = Course.createQueryBuilder();
        if (selectField !== undefined && selectField.length > 0) {
            query = query.select([
                "name AS name",
                "openingDate AS openingDate",
                ...selectField
            ]);
        }
        if (teacherId !== undefined) 
            query = query.where("teacherWorker = :id", { id: teacherId });
        query = query.orderBy("openingDate", "DESC").addOrderBy("name", "ASC");
        if (limit !== undefined)
            query = query.limit(limit);
        if (offset !== undefined)
            query = query.offset(offset);
        return query.execute()
    }

}

const CourseRepository = new CourseRepositoryImpl();
export default CourseRepository;