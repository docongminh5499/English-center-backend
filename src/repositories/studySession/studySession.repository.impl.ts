import { UserAttendStudySession } from "../../entities/UserAttendStudySession";
import StudySessionRepositoryInterface from "./studySession.repository.interface";

class StudySessionRepositoryImpl implements StudySessionRepositoryInterface{
    async findStudySessionByStudent(studentId: number, courseSlug: string): Promise<UserAttendStudySession[] | null>{
        const studentAttendStudySession = await UserAttendStudySession.createQueryBuilder("user_attend_study_session")
                                                                .leftJoinAndSelect("user_attend_study_session.studySession", "studySession")
                                                                .leftJoinAndSelect("studySession.course", "course")
                                                                .where("studentId = :studentId", {studentId: studentId})
                                                                .andWhere("course.slug = :courseSlug", {courseSlug: courseSlug})
                                                                .getMany();
        return studentAttendStudySession;
    }
}

const StudySessionRepository = new StudySessionRepositoryImpl()
export default StudySessionRepository;