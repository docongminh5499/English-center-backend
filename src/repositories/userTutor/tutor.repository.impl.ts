import moment = require("moment");
import { StudySession } from "../../entities/StudySession";
import { UserTutor } from "../../entities/UserTutor";
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
}


const TutorRepository = new TutorRepositoryImpl();
export default TutorRepository;