import { Course } from "../../entities/Course";
import { Document } from "../../entities/Document";
import Pageable from "../helpers/pageable";

export default interface DocumentRepository {
    findDocumentById: (documentId: number) => Promise<Document | null>;

    findDocumentsByCourseSlug: (courseSlug: string, pageable: Pageable) => Promise<Document[]>;

    countDocumentsByCourseSlug: (courseSlug: string) => Promise<number>;

    deleteDocument: (documentId: number) => Promise<boolean>;

    createDocument: (name: string, src: string, course: Course, author: string | null, pubYear: number | null) => Promise<Document | null>
}