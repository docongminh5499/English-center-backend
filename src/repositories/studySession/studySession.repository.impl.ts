import { StudySession } from "../../entities/StudySession";
import { UserAttendStudySession } from "../../entities/UserAttendStudySession";
import Pageable from "../helpers/pageable";
import ShiftRepository from "../shift/shift.repository.impl";
import StudySessionRepositoryInterface from "./studySession.repository.interface";

class StudySessionRepositoryImpl implements StudySessionRepositoryInterface {
    async findStudySessionByStudent(studentId: number, courseSlug: string): Promise<UserAttendStudySession[] | null> {
        const studentAttendStudySession = await UserAttendStudySession.createQueryBuilder("user_attend_study_session")
            .leftJoinAndSelect("user_attend_study_session.studySession", "studySession")
            .leftJoinAndSelect("studySession.course", "course")
            .where("studentId = :studentId", { studentId: studentId })
            .andWhere("course.slug = :courseSlug", { courseSlug: courseSlug })
            .getMany();
        return studentAttendStudySession;
    }



    async findStudySessionsByCourseSlug(courseSlug: string, pageable: Pageable): Promise<StudySession[]> {
        let queryStmt = StudySession.createQueryBuilder('ss')
            .leftJoinAndSelect("ss.teacher", "teacher")
            .leftJoinAndSelect("teacher.worker", "teacherWorker")
            .leftJoinAndSelect("teacherWorker.user", "teacherUser")
            .leftJoinAndSelect("ss.tutor", "tutor")
            .leftJoinAndSelect("tutor.worker", "tutorWorker")
            .leftJoinAndSelect("tutorWorker.user", "tutorUser")
            .leftJoinAndSelect("ss.course", "course")
            .leftJoinAndSelect("ss.classroom", "classroom")
            .leftJoinAndSelect("classroom.branch", "branch")
            .where("course.slug = :courseSlug", { courseSlug })
            .orderBy({ "ss.date": "ASC" })
        queryStmt = pageable.buildQuery(queryStmt);
        const results = await queryStmt.getMany();
        for (let index = 0; index < results.length; index++) {
            const studySession = results[index];
            studySession.shifts = await ShiftRepository.findShiftsByStudySession(studySession.id);
        }
        return results;
    }


    async countStudySessionsByCourseSlug(courseSlug: string): Promise<number> {
        let queryStmt = StudySession.createQueryBuilder('ss')
            .leftJoinAndSelect("ss.course", "course")
            .where("course.slug = :courseSlug", { courseSlug });
        return await queryStmt.getCount();
    }
}

const StudySessionRepository = new StudySessionRepositoryImpl()
export default StudySessionRepository;