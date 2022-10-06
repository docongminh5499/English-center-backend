import { validate } from "class-validator";
import { DeleteResult } from "typeorm";
import { Course } from "../../entities/Course";
import { Document } from "../../entities/Document";
import { ValidationError } from "../../utils/errors/validation.error";
import DocumentRepositoryInterface from "./document.repository.interface";

class DocumentRepositoryImpl implements DocumentRepositoryInterface {
  findDocumentById: (documentId: number) => Promise<Document | null>;


  async deleteDocument(documentId: number): Promise<boolean> {
    const result: DeleteResult = await Document
      .createQueryBuilder()
      .delete()
      .where("id = :documentId", { documentId })
      .execute();
    return result.affected !== undefined
      && result.affected !== null
      && result.affected > 0;
  }


  async createDocument(name: string, src: string, course: Course, author: string | null, pubYear: number | null): Promise<Document | null> {
    const document = new Document();
    document.name = name;
    document.author = author;
    document.pubYear = pubYear;
    document.src = src;
    document.course = course;
    
    const validateErrors = await validate(document);
    if (validateErrors.length) throw new ValidationError(validateErrors);

    const savedDocument = await document.save();
    return savedDocument.id !== null && savedDocument.id !== undefined ? savedDocument : null;
  }
}


const DocumentRepository = new DocumentRepositoryImpl();
export default DocumentRepository;