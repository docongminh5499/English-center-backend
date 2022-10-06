import moment = require("moment");
import { SelectQueryBuilder } from "typeorm";
// import { Course } from "../../../entities/Course";
import { StudentParticipateCourse } from "../../../entities/StudentParticipateCourse";
import QueryableInterface from "../../../utils/common/queryable.interface";
import { TermCourse } from "../../../utils/constants/termCuorse.constant";

export default class CourseQueryable implements QueryableInterface<StudentParticipateCourse> {
    name: string;
    type: TermCourse[] = [];
    status: "Open" | "Closed" | "All";

    map(requestBody: any): QueryableInterface<StudentParticipateCourse> {
        this.name = requestBody.name === undefined ? "" : requestBody.name.toString().trim().toLowerCase();

        // Determine Course Type
        if (requestBody.shortTerm === "true")
            this.type.push(TermCourse.ShortTerm);
        if (requestBody.longTerm === "true")
            this.type.push(TermCourse.LongTerm);
        if (this.type.length == 0)
            this.type.push(TermCourse.LongTerm, TermCourse.ShortTerm);

        // Determine Course Status
        if (requestBody.closed === "true" && requestBody.open === "false")
            this.status = "Closed";
        else if (requestBody.closed === "false" && requestBody.open === "true")
            this.status = "Open";
        else this.status = "All";

        // Return object
        return this;
    }


    buildQuery(query: SelectQueryBuilder<StudentParticipateCourse>): SelectQueryBuilder<StudentParticipateCourse> {
        query = query.leftJoinAndSelect("student_participate_course.course", "Course");
        query = query.where("Course.type IN (:...type)", { type: this.type });
        if (this.name && this.name.length > 0)
            query = query.andWhere("Course.name LIKE :name", { name: '%' + this.name + '%' });

        if (this.status == "Open")
            query = query.andWhere("Course.closingDate > :date", { date: moment().utc().format("YYYY-MM-DD hh:mm:ss") })
        else if (this.status == "Closed")
            query = query.andWhere("Course.closingDate < :date", { date: moment().utc().format("YYYY-MM-DD hh:mm:ss") })
        return query;
    }
}
