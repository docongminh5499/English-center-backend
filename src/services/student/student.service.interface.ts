import { CourseListDto, CredentialDto, FileDto, PageableDto } from "../../dto";
import { Course } from "../../entities/Course";
import { Document } from "../../entities/Document";
import { Exercise } from "../../entities/Exercise";
import { Fee } from "../../entities/Fee";
import { MakeUpLession } from "../../entities/MakeUpLession";
import { StudentDoExercise } from "../../entities/StudentDoExercise";
import { StudySession } from "../../entities/StudySession";
import { UserAttendStudySession } from "../../entities/UserAttendStudySession";
import { UserParent } from "../../entities/UserParent";
import { UserStudent } from "../../entities/UserStudent";
import Queryable from "../../utils/common/queryable.interface";


export default interface StudentService {
    getCoursesForTimetableByStudent: (studentId: number) => Promise<Course[]>;

    getCoursesByStudent: (studentId: number, pageableDto: PageableDto, queryable: Queryable<Course>) => Promise<CourseListDto>;

    getCourseDetail: (studentId: number, courseSlug: string) => Promise<Partial<Course> | null>;

    assessCourse: (studentId: number, courseId: number, content: any) => Promise<boolean>;

    getAttendance: (studentId: number, courseSlug: string) => Promise<UserAttendStudySession[]>;

    getAllExercises: (courseId: number) => Promise<Exercise[] | null>;

    submitExercise: (studentId: number, exerciseId: number, answer: any) => Promise<StudentDoExercise | null>;

    getStudentDoExercise: (studentId: number, courseId: number) => Promise<StudentDoExercise[] | null>;

    getDocument: (courseId: number) => Promise<Document[] | null>;

    getMakeupLessionCompatible: (curriculumId: number, branchId: number, order: number, courseId: number) => Promise<StudySession[] | null>;

    registerMakeupLession: (studentId: number, studySessionId: number, targetStudySessionId: number) => Promise<MakeUpLession | null>;
    
    getMakeupLession: (studentId: number) => Promise<MakeUpLession[] | null>;

    deleteMakeupLession: (studentId: number, studySessionId: number, targetStudySessionId: number) => Promise<boolean>;

    getPersonalInformation: (studentId: number) => Promise<UserStudent | null>;

    getParentList: (searchValue: string) => Promise<UserParent[] | null>;

    addParent: (studentId: number, parentId: number) => Promise<UserParent | null>;
    
    deleteParent: (studentId: number, parentId: number) => Promise<boolean>;

    modifyPersonalInformation: (userId: number, userStudent: UserStudent, avatarFile?: FileDto | null) => Promise<CredentialDto | null>;

    getPaymentHistory: (studentId: number) => Promise<Fee[] | null>;
    
}