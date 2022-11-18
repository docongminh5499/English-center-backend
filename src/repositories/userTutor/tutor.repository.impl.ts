import moment = require("moment");
import { Brackets } from "typeorm";
import { Shift } from "../../entities/Shift";
import { StudySession } from "../../entities/StudySession";
import { UserTutor } from "../../entities/UserTutor";
import Pageable from "../helpers/pageable";
import TutorRepositoryInterface from "./tutor.repository.interface";

class TutorRepositoryImpl implements TutorRepositoryInterface {
  async findTutorsAvailable(beginingDate: Date, shiftIds: number[], branchId?: number): Promise<UserTutor[]> {
    const busyTutorIdsQuery = StudySession.createQueryBuilder("ss")
      .setLock("pessimistic_read")
      .useTransaction(true)
      .leftJoinAndSelect("ss.shifts", "shifts")
      .leftJoinAndSelect("ss.tutor", "tutor")
      .leftJoinAndSelect("tutor.worker", "worker")
      .leftJoinAndSelect("worker.user", "userTutor")
      .select("userTutor.id", "id")
      .distinct(true)
      .where("ss.date >= :beginingDate", { beginingDate: moment(beginingDate).format("YYYY-MM-DD") })
      .andWhere(`shifts.id IN (:...ids)`, { ids: shiftIds });

    const freeTutorsIdQuery = UserTutor.createQueryBuilder("tt")
      .setLock("pessimistic_read")
      .useTransaction(true)
      .innerJoinAndSelect("tt.shifts", "freeShifts")
      .select("tt.tutorId", "id")
      .distinct(true)
      .where(`freeShifts.id IN (:...ids)`, { ids: shiftIds })
      .groupBy("tt.tutorId")
      .having("count(tt.tutorId) = :numberOfShifts", { numberOfShifts: shiftIds.length })


    let tutorQuery = UserTutor.createQueryBuilder("tt")
      .setLock("pessimistic_read")
      .useTransaction(true)
      .leftJoinAndSelect("tt.worker", "worker")
      .leftJoinAndSelect("worker.user", "userTutor")
    if (branchId !== undefined)
      tutorQuery = tutorQuery.leftJoinAndSelect("worker.branch", "branch");
    tutorQuery = tutorQuery.where(`userTutor.id NOT IN (${busyTutorIdsQuery.getQuery()})`)
      .andWhere(`userTutor.id IN (${freeTutorsIdQuery.getQuery()})`)
    if (branchId !== undefined)
      tutorQuery = tutorQuery.andWhere("branch.id = :branchId", { branchId })
    tutorQuery = tutorQuery.setParameters({ ...busyTutorIdsQuery.getParameters(), ...freeTutorsIdQuery.getParameters() });
    return await tutorQuery.getMany();
  }


  async findTutorsAvailableInDate(date: Date, shiftIds: number[], studySession: number, branchId?: number): Promise<UserTutor[]> {
    const busyTutorIdsQuery = StudySession.createQueryBuilder("ss")
      .setLock("pessimistic_read")
      .useTransaction(true)
      .leftJoinAndSelect("ss.shifts", "shifts")
      .leftJoinAndSelect("ss.tutor", "tutor")
      .leftJoinAndSelect("tutor.worker", "worker")
      .leftJoinAndSelect("worker.user", "userTutor")
      .select("userTutor.id", "id")
      .distinct(true)
      .where("ss.date = :date", { date: moment(date).format("YYYY-MM-DD") })
      .andWhere("ss.id <> :studySessionId", { studySessionId: studySession })
      .andWhere(`shifts.id IN (:...ids)`, { ids: shiftIds });

    const freeTutorsIdQuery = UserTutor.createQueryBuilder("tt")
      .setLock("pessimistic_read")
      .useTransaction(true)
      .innerJoinAndSelect("tt.shifts", "freeShifts")
      .select("tt.tutorId", "id")
      .distinct(true)
      .where(`freeShifts.id IN (:...ids)`, { ids: shiftIds })
      .groupBy("tt.tutorId")
      .having("count(tt.tutorId) = :numberOfShifts", { numberOfShifts: shiftIds.length })


    let tutorQuery = UserTutor.createQueryBuilder("tt")
      .setLock("pessimistic_read")
      .useTransaction(true)
      .leftJoinAndSelect("tt.worker", "worker")
      .leftJoinAndSelect("worker.user", "userTutor")
    if (branchId !== undefined)
      tutorQuery = tutorQuery.leftJoinAndSelect("worker.branch", "branch");
    tutorQuery = tutorQuery.where(`userTutor.id NOT IN (${busyTutorIdsQuery.getQuery()})`)
      .andWhere(`userTutor.id IN (${freeTutorsIdQuery.getQuery()})`)
    if (branchId !== undefined)
      tutorQuery = tutorQuery.andWhere("branch.id = :branchId", { branchId })
    tutorQuery = tutorQuery.setParameters({ ...busyTutorIdsQuery.getParameters(), ...freeTutorsIdQuery.getParameters() });
    return await tutorQuery.getMany();
  }


  async findFreeShiftsOfTutor(tutorId: number): Promise<Shift[]> {
    const result = await UserTutor.createQueryBuilder("tt")
      .setLock("pessimistic_read")
      .useTransaction(true)
      .leftJoinAndSelect("tt.shifts", "shifts")
      .where("tt.tutorId = :id", { id: tutorId })
      .getOne();
    if (result == null) return [];
    return result.shifts;
  }


  async findTutorById(tutorId: number): Promise<UserTutor | null> {
    return await UserTutor.createQueryBuilder("tutor")
      .setLock("pessimistic_read")
      .useTransaction(true)
      .leftJoinAndSelect("tutor.worker", "worker")
      .leftJoinAndSelect("worker.user", "user")
      .leftJoinAndSelect("worker.branch", "branch")
      .leftJoinAndSelect("branch.userEmployee", "manager")
      .leftJoinAndSelect("manager.worker", "managerWorker")
      .leftJoinAndSelect("managerWorker.user", "managerUser")
      .leftJoinAndSelect("branch.userTeacher", "teacherManager")
      .leftJoinAndSelect("teacherManager.worker", "teacherManagerWorker")
      .leftJoinAndSelect("teacherManagerWorker.user", "teacherManagerUser")
      .where("user.id = :userId", { userId: tutorId })
      .getOne();
  }


  async findTutorByBranch(branchId: number, pageable: Pageable, query?: string): Promise<UserTutor[]> {
    let queryStmt = UserTutor
      .createQueryBuilder("tt")
      .setLock("pessimistic_read")
      .useTransaction(true)
      .leftJoinAndSelect("tt.worker", "worker")
      .leftJoinAndSelect("worker.user", "user")
      .leftJoinAndSelect("worker.branch", "branch")
      .where("branch.id = :branchId", { branchId })
      .orderBy("user.fullName", "ASC");
    if (query !== undefined && query.trim().length > 0)
      queryStmt = queryStmt.andWhere(new Brackets(qb => {
        qb.where("user.fullName LIKE :query", { query: '%' + query + '%' })
          .orWhere("user.id LIKE :query", { query: '%' + query + '%' })
      }));
    queryStmt = pageable.buildQuery(queryStmt);
    return await queryStmt.getMany();
  }


  async countTutorByBranch(branchId: number, query?: string): Promise<number> {
    let queryStmt = UserTutor
      .createQueryBuilder("tt")
      .setLock("pessimistic_read")
      .useTransaction(true)
      .leftJoinAndSelect("tt.worker", "worker")
      .leftJoinAndSelect("worker.user", "user")
      .leftJoinAndSelect("worker.branch", "branch")
      .where("branch.id = :branchId", { branchId });
    if (query !== undefined && query.trim().length > 0)
      queryStmt = queryStmt.andWhere(new Brackets(qb => {
        qb.where("user.fullName LIKE :query", { query: '%' + query + '%' })
          .orWhere("user.id LIKE :query", { query: '%' + query + '%' })
      }));
    return await queryStmt.getCount();
  }
}


const TutorRepository = new TutorRepositoryImpl();
export default TutorRepository;