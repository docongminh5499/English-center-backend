import { Shift } from "../../entities/Shift";
import { StudySession } from "../../entities/StudySession";
import ShiftRepositoryInterface from "./shift.repository.interface";

class ShiftRepositoryImpl implements ShiftRepositoryInterface {
  async findById(id: number | undefined): Promise<Shift> {
    const shift = await Shift.findOne({
      where: { id: id }
    });
    return shift!;
  }



  async findAvailableShiftsOfTeacher(teacherId: number, beginingDate: Date): Promise<Shift[]> {
    const busyShiftIdsOfTeacherQuery = StudySession.createQueryBuilder("ss")
      .leftJoinAndSelect("ss.shifts", "shifts")
      .leftJoinAndSelect("ss.teacher", "teacher")
      .leftJoinAndSelect("teacher.worker", "worker")
      .leftJoinAndSelect("worker.user", "userTeacher")
      .select("shifts.id", "id")
      .distinct(true)
      .where("userTeacher.id = :teacherId", { teacherId })
      .andWhere("ss.date >= :beginingDate", { beginingDate })
    const availableShiftsQuery = Shift.createQueryBuilder("s")
      .where(`s.id NOT IN (${busyShiftIdsOfTeacherQuery.getQuery()})`)
      .setParameters(busyShiftIdsOfTeacherQuery.getParameters())
      .orderBy({
        "s.weekDay": "ASC",
        "s.startTime": "ASC",
      });
    return await availableShiftsQuery.getMany();
  }


  async findShiftsByStudySession(studySessionId: number): Promise<Shift[]> {
    return await Shift.createQueryBuilder('shift')
      .leftJoinAndSelect("shift.studySessions", "studySessions")
      .where(`studySessions.id = :studySessionId`, { studySessionId })
      .orderBy({ "startTime": "ASC" })
      .getMany();
  }
}

const ShiftRepository = new ShiftRepositoryImpl();
export default ShiftRepository;