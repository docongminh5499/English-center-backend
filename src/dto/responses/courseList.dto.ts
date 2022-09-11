import { Course } from "../../entities/Course"

export default class CourseListDto {
    courses?: Partial<Course>[];
    total?: number;
    limit?: number;
    skip?: number;
}