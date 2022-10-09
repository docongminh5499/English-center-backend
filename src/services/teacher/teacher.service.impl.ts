import { PageableDto, CourseListDto, DocumentDto, CourseDetailDto } from "../../dto";
import { Course } from "../../entities/Course";
import { CourseRepository, Pageable, Selectable, Sortable } from "../../repositories";
import ExerciseRepository from "../../repositories/exercise/exercise.repository.impl";
import DocumentRepository from "../../repositories/document/document.repository.impl";
import Queryable from "../../utils/common/queryable.interface";
import TeacherServiceInterface from "./teacher.service.interface";
import { Document } from "../../entities/Document";
import { ValidationError } from "../../utils/errors/validation.error";
import { DOCUMENT_DESTINATION_SRC } from "../../utils/constants/document.constant";

class TeacherServiceImpl implements TeacherServiceInterface {
  async getCoursesByTeacher(teacherId: number, pageableDto: PageableDto, queryable: Queryable<Course>): Promise<CourseListDto> {
    const selectable = new Selectable()
      .add("Course.id", "id")
      .add("Course.image", "image")
      .add("closingDate", "closingDate")
      .add("Course.name", "name")
      .add("openingDate", "openingDate")
      .add("slug", "slug");
    const sortable = new Sortable()
      .add("openingDate", "DESC")
      .add("name", "ASC");
    const pageable = new Pageable(pageableDto);

    const [courseCount, courseList] = await Promise.all([
      CourseRepository.countCourseByTeacher(queryable, teacherId),
      CourseRepository.findCourseByTeacher(pageable, sortable, selectable, queryable, teacherId)
    ]);

    const courseListDto = new CourseListDto();
    courseListDto.courses = courseList;
    courseListDto.limit = pageable.limit;
    courseListDto.skip = pageable.offset;
    courseListDto.total = courseCount;

    return courseListDto;
  }


  async getCourseDetail(teacherId: number, courseSlug: string): Promise<Partial<CourseDetailDto> | null> {
    const course = await CourseRepository.findCourseBySlug(courseSlug);
    if (course?.teacher.worker.user.id !== teacherId)
      return null;
    const courseDetail = new CourseDetailDto();
    courseDetail.version = course.version;
    courseDetail.id = course.id;
    courseDetail.slug = course.slug;
    courseDetail.name = course.name;
    courseDetail.maxNumberOfStudent = course.maxNumberOfStudent;
    courseDetail.price = course.price;
    courseDetail.openingDate = course.openingDate;
    courseDetail.closingDate = course.closingDate;
    courseDetail.expectedClosingDate = course.expectedClosingDate;
    courseDetail.image = course.image;
    courseDetail.documents = course.documents;
    courseDetail.studySessions = course.studySessions;
    courseDetail.exercises = course.exercises;
    courseDetail.curriculum = course.curriculum;
    courseDetail.studentPaticipateCourses = course.studentPaticipateCourses.map(participation => ({
      student: participation.student,
      course: participation.course,
      billingDate: participation.billingDate,
    }));
    courseDetail.maskedComments = course.studentPaticipateCourses
      .filter(participation =>
        participation.starPoint !== null &&
        participation.starPoint !== undefined)
      .map(participation => ({
        comment: participation.comment,
        starPoint: participation.starPoint,
        userFullName: participation.isIncognito ? "Người dùng đã ẩn danh" : participation.student.user.fullName,
        commentDate: participation.commentDate
      }));
    return courseDetail;
  }


  async deleteExercise(teacherId: number, exerciseId: number): Promise<boolean> {
    // const exercise = await ExerciseRepository.findExerciseById(exerciseId);
    // if (exercise)
    const result = await ExerciseRepository.deleteExercise(exerciseId);
    return result;
  }


  async deleteDocument(teacherId: number, documentId: number): Promise<boolean> {
    const result = await DocumentRepository.deleteDocument(documentId);
    return result;
  }

  async createDocument(documentDto: DocumentDto): Promise<Document | null> {
    if (documentDto.courseSlug === undefined)
      throw new ValidationError([]);
    const course = await CourseRepository.findCourseBySlug(documentDto.courseSlug);
    if (course === null)
      throw new ValidationError([]);

    let documentSrc = "";
    if (documentDto.documentType === "link" && documentDto.documentLink)
      documentSrc = documentDto.documentLink;
    else if (documentDto.documentType === "file" && documentDto.documentFile && documentDto.documentFile.fieldname)
      documentSrc = DOCUMENT_DESTINATION_SRC + documentDto.documentFile.filename;
    else throw new ValidationError([]);

    return await DocumentRepository.createDocument(
      documentDto.documentName,
      documentSrc,
      course,
      documentDto.documentAuthor || null,
      documentDto.documentYear || null,
    );
  }

}

const TeacherService = new TeacherServiceImpl();
export default TeacherService;