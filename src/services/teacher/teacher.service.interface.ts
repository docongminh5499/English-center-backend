import { CourseDetailDto, CourseListDto, DocumentDto, PageableDto } from "../../dto";
import { Course } from "../../entities/Course";
import { Document } from "../../entities/Document";
import Queryable from "../../utils/common/queryable.interface";

export default interface TeacherService {
    getCoursesByTeacher: (teacherId: number, pageableDto: PageableDto, queryable: Queryable<Course>) => Promise<CourseListDto>;

    getCourseDetail: (teacherId: number, courseSlug: string) => Promise<Partial<CourseDetailDto> | null>;

    deleteExercise: (teacherId: number, exerciseId: number) => Promise<boolean>;

    deleteDocument: (teacherId: number, documentId: number) => Promise<boolean>;

    createDocument: (documentDto: DocumentDto) => Promise<Document | null>;
}