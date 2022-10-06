import { Course } from "../../entities/Course";
import { Document } from "../../entities/Document";

export default interface DocumentRepository {
    findDocumentById: (documentId: number) => Promise<Document | null>;

    deleteDocument: (documentId: number) => Promise<boolean>;

    createDocument: (name: string, src: string, course: Course, author: string | null, pubYear: number | null) => Promise<Document | null>
}