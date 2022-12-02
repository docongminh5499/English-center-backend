import { SelectQueryBuilder } from "typeorm";
import { Course } from "../../../entities/Course";
import QueryableInterface from "../../../utils/common/queryable.interface";
import { TermCourse } from "../../../utils/constants/termCuorse.constant";

export default class CourseQueryable implements QueryableInterface<Course> {
    name: string;
    type: TermCourse[] = [];
    status: "Open" | "Closed" | "All";

    map(requestBody: any): QueryableInterface<Course> {
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


    buildQuery(query: SelectQueryBuilder<Course>): SelectQueryBuilder<Course> {
        query = query.leftJoinAndSelect("Course.studentPaticipateCourses", "student_participate_course")
                     .leftJoinAndSelect("Course.curriculum", "curriculum");
        query = query.where("curriculum.type IN (:...type)", { type: this.type })
                        // .andWhere("Course.lockTime IS NULL OR Course.lockTime > :now", {now: new Date()});
        if (this.name && this.name.length > 0)
            query = query.andWhere("Course.name LIKE :name", { name: '%' + this.name + '%' });

        if (this.status == "Open")
            query = query.andWhere("Course.closingDate > :date", { date: new Date() })
        else if (this.status == "Closed")
            query = query.andWhere("Course.closingDate < :date", { date: new Date() })
        return query;
    }
}
