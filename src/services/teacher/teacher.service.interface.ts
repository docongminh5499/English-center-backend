import { CourseDetailDto, CourseListDto, CredentialDto, DocumentDto, FileDto, PageableDto } from "../../dto";
import CurriculumDto from "../../dto/requests/curriculum.dto";
import MaskedComment from "../../dto/responses/maskedComment.dto";
import { Course } from "../../entities/Course";
import { Curriculum } from "../../entities/Curriculum";
import { Document } from "../../entities/Document";
import { Exercise } from "../../entities/Exercise";
import { UserStudent } from "../../entities/UserStudent";
import { UserTeacher } from "../../entities/UserTeacher";
import Queryable from "../../utils/common/queryable.interface";

export default interface TeacherService {
    getCoursesByTeacher: (teacherId: number, pageableDto: PageableDto, queryable: Queryable<Course>) => Promise<CourseListDto>;

    getCourseDetail: (teacherId: number, courseSlug: string) => Promise<Partial<CourseDetailDto> | null>;

    getStudents: (userId: number, courseSlug: string, query: string, pageableDto: PageableDto) => Promise<{ total: number, students: UserStudent[] }>;

    getExercises: (userId: number, courseSlug: string, pageableDto: PageableDto) => Promise<{ total: number, exercises: Exercise[] }>;

    deleteExercise: (teacherId: number, exerciseId: number) => Promise<boolean>;

    getDocuments: (userId: number, courseSlug: string, pageableDto: PageableDto) => Promise<{ total: number, documents: Document[] }>;

    deleteDocument: (teacherId: number, documentId: number) => Promise<boolean>;

    createDocument: (documentDto: DocumentDto) => Promise<Document | null>;

    getComment: (userId: number, courseSlug: string, pageableDto: PageableDto)
        => Promise<{ total: number, average: number, starTypeCount: object, comments: MaskedComment[] }>;

    getPersonalInformation: (userId: number) => Promise<UserTeacher>;

    modifyPersonalInformation: (userId: number, userTeacher: UserTeacher, avatarFile?: FileDto | null) => Promise<CredentialDto | null>;

    getCurriculumList: (userId?: number) => Promise<Curriculum[]>;

    getCurriculum: (userId?: number, curriculumId?: number) => Promise<Curriculum | null>;

    modifyCurriculum: (userId?: number, curriculum?: CurriculumDto) => Promise<Curriculum | null>;

    createCurriculum: (userId?: number, curriculumDto?: CurriculumDto) => Promise<Curriculum | null>;

    deleteCurriculum: (curriculumId?: number) => Promise<boolean>;
}