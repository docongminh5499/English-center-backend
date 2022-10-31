import { CourseDetailDto, CourseListDto, CredentialDto, DocumentDto, FileDto, PageableDto } from "../../dto";
import CurriculumDto from "../../dto/requests/curriculum.dto";
import MaskedComment from "../../dto/responses/maskedComment.dto";
import { Course } from "../../entities/Course";
import { Curriculum } from "../../entities/Curriculum";
import { Document } from "../../entities/Document";
import { Exercise } from "../../entities/Exercise";
import { MakeUpLession } from "../../entities/MakeUpLession";
import { StudentDoExercise } from "../../entities/StudentDoExercise";
import { StudySession } from "../../entities/StudySession";
import { UserAttendStudySession } from "../../entities/UserAttendStudySession";
import { UserEmployee } from "../../entities/UserEmployee";
import { UserStudent } from "../../entities/UserStudent";
import { UserTeacher } from "../../entities/UserTeacher";
import Queryable from "../../utils/common/queryable.interface";

export default interface TeacherService {
    getCoursesByTeacher: (teacherId: number, pageableDto: PageableDto, queryable: Queryable<Course>) => Promise<CourseListDto>;

    getCourseDetail: (teacherId: number, courseSlug: string) => Promise<Partial<CourseDetailDto> | null>;

    getStudents: (userId: number, courseSlug: string, query: string, pageableDto: PageableDto) => Promise<{ total: number, students: UserStudent[] }>;

    getStudentDetailsInCourse: (userId: number, studentId: number, courseSlug: string) => Promise<{ student: UserStudent, doExercises: StudentDoExercise[], attendences: UserAttendStudySession[], makeUpLessons: MakeUpLession[] }>;

    getExercises: (userId: number, courseSlug: string, pageableDto: PageableDto) => Promise<{ total: number, exercises: Exercise[] }>;

    deleteExercise: (teacherId: number, exerciseId: number) => Promise<boolean>;

    getDocuments: (userId: number, courseSlug: string, pageableDto: PageableDto) => Promise<{ total: number, documents: Document[] }>;

    deleteDocument: (teacherId: number, documentId: number) => Promise<boolean>;

    createDocument: (userId: number, documentDto: DocumentDto) => Promise<Document | null>;

    getComment: (userId: number, courseSlug: string, pageableDto: PageableDto)
        => Promise<{ total: number, average: number, starTypeCount: object, comments: MaskedComment[] }>;

    getStudySessions: (teacherId: number, courseSlug: string,
        pageableDto: PageableDto) => Promise<{ total: number, studySessions: StudySession[] }>;

    getStudySessionDetail: (teacherId?: number, studySessionId?: number)
        => Promise<{ studySession: StudySession | null, attendences: UserAttendStudySession[], makeups: MakeUpLession[], ownMakeups: MakeUpLession[] }>;

    modifyStudySessionDetail: (teacherId?: number, studySession?: StudySession, attendences?: UserAttendStudySession[], makeups?: MakeUpLession[]) => Promise<boolean>;

    getPersonalInformation: (userId: number) => Promise<UserTeacher>;

    modifyPersonalInformation: (userId: number, userTeacher: UserTeacher, avatarFile?: FileDto | null) => Promise<CredentialDto | null>;

    getCurriculumList: (userId?: number) => Promise<Curriculum[]>;

    getCurriculum: (userId?: number, curriculumId?: number) => Promise<Curriculum | null>;

    modifyCurriculum: (userId?: number, curriculum?: CurriculumDto) => Promise<Curriculum | null>;

    createCurriculum: (userId?: number, curriculumDto?: CurriculumDto) => Promise<Curriculum | null>;

    deleteCurriculum: (curriculumId?: number) => Promise<boolean>;

    getPreferedCurriculums: (userId?: number) => Promise<Curriculum[]>;

    getCheckPreferredCurriculum: (userId?: number, curriculumId?: number) => Promise<boolean>;

    addPreferredCurriculum: (userId?: number, curriculumId?: number) => Promise<boolean>;

    removePreferredCurriculum: (userId?: number, curriculumId?: number) => Promise<boolean>;

    closeCourse: (userId?: number, courseSlug?: string) => Promise<Course | null>;

    getSchedule: (pageableDto: PageableDto, userId?: number, startDate?: Date, endDate?: Date) => Promise<{ total: number, studySessions: StudySession[] }>;

    getEmployeeByBranch: (userId?: number, branchId?: number) => Promise<UserEmployee[]>;
}