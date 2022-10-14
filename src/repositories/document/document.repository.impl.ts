import { validate } from "class-validator";
import { DeleteResult } from "typeorm";
import { Course } from "../../entities/Course";
import { Document } from "../../entities/Document";
import { ValidationError } from "../../utils/errors/validation.error";
import Pageable from "../helpers/pageable";
import DocumentRepositoryInterface from "./document.repository.interface";

class DocumentRepositoryImpl implements DocumentRepositoryInterface {
  async findDocumentById(documentId: number): Promise<Document | null> {
    const document = await Document
      .findOne({
        where: { id: documentId },
        relations: [
          "course",
          "course.teacher",
          "course.teacher.worker",
          "course.teacher.worker.user"
        ]
      });
    return document;
  }


  async findDocumentsByCourseSlug(courseSlug: string, pageable: Pageable): Promise<Document[]> {
    let queryStmt = Document.createQueryBuilder('document')
      .leftJoinAndSelect("document.course", "course")
      .where("course.slug = :courseSlug", { courseSlug })
      .orderBy({ "document.name": "ASC" })
    queryStmt = pageable.buildQuery(queryStmt);
    return await queryStmt.getMany();
  }


  async countDocumentsByCourseSlug(courseSlug: string): Promise<number> {
    let queryStmt = Document.createQueryBuilder('document')
      .leftJoinAndSelect("document.course", "course")
      .where("course.slug = :courseSlug", { courseSlug })
    return await queryStmt.getCount();
  }


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