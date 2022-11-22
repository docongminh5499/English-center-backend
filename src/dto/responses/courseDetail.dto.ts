import { Curriculum } from "../../entities/Curriculum";
import { Exercise } from "../../entities/Exercise";
import { StudySession } from "../../entities/StudySession";
import { Document } from "../../entities/Document";
import { UserStudent } from "../../entities/UserStudent";
import { Course } from "../../entities/Course";
import MaskedComment from "./maskedComment.dto";
import { Branch } from "../../entities/Branch";
import { UserTeacher } from "../../entities/UserTeacher";

export default class CourseDetailDto {
    version: number;
    id: number;
    slug: string;
    name: string;
    maxNumberOfStudent: number;
    price: number;
    openingDate: Date;
    closingDate: Date | null;
    expectedClosingDate: Date;
    image: string;
    documents: Document[];
    studySessions: StudySession[];
    exercises: Exercise[];
    curriculum: Curriculum;
    studentPaticipateCourses: {
        student: UserStudent;
        course: Course;
        billingDate: Date;
    }[];
    maskedComments: MaskedComment[];
    branch: Branch;
    teacher: UserTeacher;
    lockTime: Date | null;
    sessionPerWeek: number;
}