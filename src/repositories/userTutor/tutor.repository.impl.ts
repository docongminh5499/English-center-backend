import { StudySession } from "../../entities/StudySession";
import { UserTutor } from "../../entities/UserTutor";
import TutorRepositoryInterface from "./tutor.repository.interface";

class TutorRepositoryImpl implements TutorRepositoryInterface {
  async findTutorsAvailable(beginingDate: Date, shiftIds: number[]): Promise<UserTutor[]> {
    const busyTutorIdsQuery = StudySession.createQueryBuilder("ss")
      .leftJoinAndSelect("ss.shifts", "shifts")
      .leftJoinAndSelect("ss.tutor", "tutor")
      .leftJoinAndSelect("tutor.worker", "worker")
      .leftJoinAndSelect("worker.user", "userTutor")
      .select("userTutor.id", "id")
      .distinct(true)
      .where("ss.date >= :beginingDate", { beginingDate })
      .andWhere(`shifts.id IN (:...ids)`, { ids: shiftIds });

    const freeTutorsIdQuery = UserTutor.createQueryBuilder("tt")
      .innerJoinAndSelect("tt.shifts", "freeShifts")
      .select("tt.tutorId", "id")
      .distinct(true)
      .where(`freeShifts.id IN (:...ids)`, { ids: shiftIds })
      .groupBy("tt.tutorId")
      .having("count(tt.tutorId) = :numberOfShifts", { numberOfShifts: shiftIds.length })


    const tutorQuery = UserTutor.createQueryBuilder("tt")
      .leftJoinAndSelect("tt.worker", "worker")
      .leftJoinAndSelect("worker.user", "userTutor")
      .where(`userTutor.id NOT IN (${busyTutorIdsQuery.getQuery()})`)
      .andWhere(`userTutor.id IN (${freeTutorsIdQuery.getQuery()})`)
      .setParameters({ ...busyTutorIdsQuery.getParameters(), ...freeTutorsIdQuery.getParameters() });
    return await tutorQuery.getMany();
  }
}


const TutorRepository = new TutorRepositoryImpl();
export default TutorRepository;