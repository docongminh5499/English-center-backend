import { Course } from "../../entities/Course";
import { UserStudent } from "../../entities/UserStudent";

export default class UnpaidDto {
    student: UserStudent;
    course: Course;
    fromDate: Date;
    toDate: Date;
    amount: number;
}