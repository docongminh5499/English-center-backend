import moment = require("moment");
import { Brackets } from "typeorm";
import { StudySession } from "../../entities/StudySession";
import { UserAttendStudySession } from "../../entities/UserAttendStudySession";
import Pageable from "../helpers/pageable";
import ShiftRepository from "../shift/shift.repository.impl";
import StudySessionRepositoryInterface from "./studySession.repository.interface";

class StudySessionRepositoryImpl implements StudySessionRepositoryInterface {
    async findStudySessionByStudent(studentId: number, courseSlug: string): Promise<UserAttendStudySession[] | null> {
        const studentAttendStudySession = await UserAttendStudySession.createQueryBuilder("user_attend_study_session")
            .setLock("pessimistic_read")
            .useTransaction(true)
            .leftJoinAndSelect("user_attend_study_session.studySession", "studySession")
            .leftJoinAndSelect("studySession.course", "course")
            .where("studentId = :studentId", { studentId: studentId })
            .andWhere("course.slug = :courseSlug", { courseSlug: courseSlug })
            .getMany();
        return studentAttendStudySession;
    }



    async findStudySessionsByCourseSlugAndTeacher(courseSlug: string, pageable: Pageable, teacherId?: number | undefined): Promise<StudySession[]> {
        let queryStmt = StudySession.createQueryBuilder('ss')
            .setLock("pessimistic_read")
            .useTransaction(true)
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
            .orderBy({ "ss.date": "ASC" });
        if (teacherId !== undefined)
            queryStmt = queryStmt.andWhere("teacherUser.id = :teacherId", { teacherId })
        queryStmt = pageable.buildQuery(queryStmt);
        const results = await queryStmt.getMany();
        for (let index = 0; index < results.length; index++) {
            const studySession = results[index];
            studySession.shifts = await ShiftRepository.findShiftsByStudySession(studySession.id);
        }
        return results;
    }


    async countStudySessionsByCourseSlugAndTeacher(courseSlug: string, teacherId?: number | undefined): Promise<number> {
        let queryStmt = StudySession.createQueryBuilder('ss')
            .setLock("pessimistic_read")
            .useTransaction(true)
            .leftJoinAndSelect("ss.course", "course")
            .where("course.slug = :courseSlug", { courseSlug });
        if (teacherId !== undefined)
            queryStmt = queryStmt.andWhere("ss.teacherWorker = :teacherId", { teacherId })
        return await queryStmt.getCount();
    }


    async findStudySessionById(studySessionId: number): Promise<StudySession | null> {
        const studySession = await StudySession.createQueryBuilder('ss')
            .setLock("pessimistic_read")
            .useTransaction(true)
            .leftJoinAndSelect("ss.course", "course")
            .leftJoinAndSelect("course.teacher", "courseTeacher")
            .leftJoinAndSelect("courseTeacher.worker", "courseTeacherWorker")
            .leftJoinAndSelect("courseTeacherWorker.user", "courseTeacherUser")
            .leftJoinAndSelect("ss.teacher", "teacher")
            .leftJoinAndSelect("teacher.worker", "teacherWorker")
            .leftJoinAndSelect("teacherWorker.user", "teacherUser")
            .leftJoinAndSelect("ss.tutor", "tutor")
            .leftJoinAndSelect("tutor.worker", "tutorWorker")
            .leftJoinAndSelect("tutorWorker.user", "tutorUser")
            .leftJoinAndSelect("ss.classroom", "classroom")
            .leftJoinAndSelect("classroom.branch", "branch")
            .where("ss.id = :studySessionId", { studySessionId })
            .getOne();
        if (studySession !== null)
            studySession.shifts = await ShiftRepository.findShiftsByStudySession(studySession.id);
        return studySession;
    }


    async findCourseIdsByTeacherId(teacherId: number): Promise<{ id: number }[]> {
        return await StudySession.createQueryBuilder("ss")
            .select("ss.courseId", "id")
            .distinct(true)
            .where("teacherWorker = :id", { id: teacherId })
            .execute();
    }


    async findStudySessionsByTeacherId(teacherId: number, startDate: Date, endDate: Date, pageable: Pageable): Promise<StudySession[]> {
        let queryStmt = StudySession.createQueryBuilder('ss')
            .setLock("pessimistic_read")
            .useTransaction(true)
            .leftJoinAndSelect("ss.teacher", "teacher")
            .leftJoinAndSelect("teacher.worker", "teacherWorker")
            .leftJoinAndSelect("teacherWorker.user", "teacherUser")
            .leftJoinAndSelect("ss.course", "course")
            .leftJoinAndSelect("course.teacher", "courseTeacher")
            .leftJoinAndSelect("courseTeacher.worker", "courseTeacherWorker")
            .leftJoinAndSelect("courseTeacherWorker.user", "courseTeacherUser")
            .leftJoinAndSelect("ss.classroom", "classroom")
            .leftJoinAndSelect("classroom.branch", "branch")
            .where(new Brackets(qb => {
                qb.where("teacherUser.id = :teacherId", { teacherId })
                    .orWhere("courseTeacherUser.id = :teacherId", { teacherId })
            }))
            .andWhere("ss.date >= :startDate", { startDate: moment(startDate).format("YYYY-MM-DD") })
            .andWhere("ss.date <= :endDate", { endDate: moment(endDate).format("YYYY-MM-DD") })
            .orderBy({ "ss.date": "ASC" });
        queryStmt = pageable.buildQuery(queryStmt);
        const results = await queryStmt.getMany();
        for (let index = 0; index < results.length; index++) {
            const studySession = results[index];
            studySession.shifts = await ShiftRepository.findShiftsByStudySession(studySession.id);
        }
        return results;
    }


    async countStudySessionsByTeacherId(teacherId: number, startDate: Date, endDate: Date): Promise<number> {
        return await StudySession.createQueryBuilder('ss')
            .setLock("pessimistic_read")
            .useTransaction(true)
            .leftJoinAndSelect("ss.teacher", "teacher")
            .leftJoinAndSelect("teacher.worker", "teacherWorker")
            .leftJoinAndSelect("teacherWorker.user", "teacherUser")
            .leftJoinAndSelect("ss.course", "course")
            .leftJoinAndSelect("course.teacher", "courseTeacher")
            .leftJoinAndSelect("courseTeacher.worker", "courseTeacherWorker")
            .leftJoinAndSelect("courseTeacherWorker.user", "courseTeacherUser")
            .where(new Brackets(qb => {
                qb.where("teacherUser.id = :teacherId", { teacherId })
                    .orWhere("courseTeacherUser.id = :teacherId", { teacherId })
            }))
            .andWhere("ss.date >= :startDate", { startDate: moment(startDate).format("YYYY-MM-DD") })
            .andWhere("ss.date <= :endDate", { endDate: moment(endDate).format("YYYY-MM-DD") })
            .getCount();
    }


    async findStudySessionsByTutorId(tutorId: number, startDate: Date, endDate: Date, pageable: Pageable): Promise<StudySession[]> {
        let queryStmt = StudySession.createQueryBuilder('ss')
            .setLock("pessimistic_read")
            .useTransaction(true)
            .leftJoinAndSelect("ss.tutor", "tutor")
            .leftJoinAndSelect("tutor.worker", "tutorWorker")
            .leftJoinAndSelect("tutorWorker.user", "tutorUser")
            .leftJoinAndSelect("ss.course", "course")
            .leftJoinAndSelect("ss.classroom", "classroom")
            .leftJoinAndSelect("classroom.branch", "branch")
            .where("tutorUser.id = :tutorId", { tutorId })
            .andWhere("ss.date >= :startDate", { startDate: moment(startDate).format("YYYY-MM-DD") })
            .andWhere("ss.date <= :endDate", { endDate: moment(endDate).format("YYYY-MM-DD") })
            .orderBy({ "ss.date": "ASC" });
        queryStmt = pageable.buildQuery(queryStmt);
        const results = await queryStmt.getMany();
        for (let index = 0; index < results.length; index++) {
            const studySession = results[index];
            studySession.shifts = await ShiftRepository.findShiftsByStudySession(studySession.id);
        }
        return results;
    }


    async countStudySessionsByTutorId(tutorId: number, startDate: Date, endDate: Date): Promise<number> {
        return await StudySession.createQueryBuilder('ss')
            .setLock("pessimistic_read")
            .useTransaction(true)
            .leftJoinAndSelect("ss.tutor", "tutor")
            .leftJoinAndSelect("tutor.worker", "tutorWorker")
            .leftJoinAndSelect("tutorWorker.user", "tutorUser")
            .leftJoinAndSelect("ss.course", "course")
            .leftJoinAndSelect("ss.classroom", "classroom")
            .leftJoinAndSelect("classroom.branch", "branch")
            .where("tutorUser.id = :tutorId", { tutorId })
            .andWhere("ss.date >= :startDate", { startDate: moment(startDate).format("YYYY-MM-DD") })
            .andWhere("ss.date <= :endDate", { endDate: moment(endDate).format("YYYY-MM-DD") })
            .getCount();
    }


    async findCourseIdsByTutorId(tutorId: number): Promise<{ id: number }[]> {
        return await StudySession.createQueryBuilder("ss")
            .select("ss.courseId", "id")
            .distinct(true)
            .where("tutorWorker = :id", { id: tutorId })
            .execute();
    }


    async findStudySessionsByCourseSlugAndTutor(courseSlug: string, pageable: Pageable, tutorId: number): Promise<StudySession[]> {
        let queryStmt = StudySession.createQueryBuilder('ss')
            .setLock("pessimistic_read")
            .useTransaction(true)
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
            .andWhere("tutorUser.id = :tutorId", { tutorId })
            .orderBy({ "ss.date": "ASC" });
        queryStmt = pageable.buildQuery(queryStmt);
        const results = await queryStmt.getMany();
        for (let index = 0; index < results.length; index++) {
            const studySession = results[index];
            studySession.shifts = await ShiftRepository.findShiftsByStudySession(studySession.id);
        }
        return results;
    }


    async countStudySessionsByCourseSlugAndTutor(courseSlug: string, tutorId: number): Promise<number> {
        let queryStmt = StudySession.createQueryBuilder('ss')
            .setLock("pessimistic_read")
            .useTransaction(true)
            .leftJoinAndSelect("ss.course", "course")
            .where("course.slug = :courseSlug", { courseSlug })
            .andWhere("ss.tutorWorker = :tutorId", { tutorId })
        return await queryStmt.getCount();
    }
}

const StudySessionRepository = new StudySessionRepositoryImpl()
export default StudySessionRepository;