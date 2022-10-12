import { CourseDetailDto, CourseListDto, CredentialDto, DocumentDto, FileDto, PageableDto } from "../../dto";
import CurriculumDto from "../../dto/requests/curriculum.dto";
import { Course } from "../../entities/Course";
import { Curriculum } from "../../entities/Curriculum";
import { Document } from "../../entities/Document";
import { UserTeacher } from "../../entities/UserTeacher";
import Queryable from "../../utils/common/queryable.interface";

export default interface TeacherService {
    getCoursesByTeacher: (teacherId: number, pageableDto: PageableDto, queryable: Queryable<Course>) => Promise<CourseListDto>;

    getCourseDetail: (teacherId: number, courseSlug: string) => Promise<Partial<CourseDetailDto> | null>;

    deleteExercise: (teacherId: number, exerciseId: number) => Promise<boolean>;

    deleteDocument: (teacherId: number, documentId: number) => Promise<boolean>;

    createDocument: (documentDto: DocumentDto) => Promise<Document | null>;

    getPersonalInformation: (userId: number) => Promise<UserTeacher>;

    modifyPersonalInformation: (userId: number, userTeacher: UserTeacher, avatarFile?: FileDto | null) => Promise<CredentialDto | null>;

    getCurriculumList: (userId?: number) => Promise<Curriculum[]>;

    getCurriculum: (userId?: number, curriculumId? : number) => Promise<Curriculum | null>;

    modifyCurriculum: (userId?: number, curriculum?: CurriculumDto) => Promise<Curriculum | null>;

    createCurriculum: (userId?: number, curriculumDto?: CurriculumDto) => Promise<Curriculum | null>;

    deleteCurriculum: (curriculumId?: number) => Promise<boolean>;
}