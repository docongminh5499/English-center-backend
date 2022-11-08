import moment = require("moment");
import { Shift } from "../../entities/Shift";
import { StudySession } from "../../entities/StudySession";
import { Weekday } from "../../utils/constants/weekday.constant";
import ShiftRepositoryInterface from "./shift.repository.interface";

class ShiftRepositoryImpl implements ShiftRepositoryInterface {
  async findById(id: number | undefined): Promise<Shift> {
    const shift = await Shift.findOne({
      where: { id: id },
      lock: { mode: "pessimistic_read" },
      transaction: true
    });
    return shift!;
  }



  async findAvailableShiftsOfTeacher(teacherId: number, beginingDate: Date): Promise<Shift[]> {
    const busyShiftIdsOfTeacherQuery = StudySession.createQueryBuilder("ss")
      .setLock("pessimistic_read")
      .useTransaction(true)
      .leftJoinAndSelect("ss.shifts", "shifts")
      .leftJoinAndSelect("ss.teacher", "teacher")
      .leftJoinAndSelect("teacher.worker", "worker")
      .leftJoinAndSelect("worker.user", "userTeacher")
      .select("shifts.id", "id")
      .distinct(true)
      .where("userTeacher.id = :teacherId", { teacherId })
      .andWhere("ss.date >= :beginingDate", { beginingDate: moment(beginingDate).format("YYYY-MM-DD") })
    const availableShiftsQuery = Shift.createQueryBuilder("s")
      .setLock("pessimistic_read")
      .useTransaction(true)
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
      .setLock("pessimistic_read")
      .useTransaction(true)
      .leftJoinAndSelect("shift.studySessions", "studySessions")
      .where(`studySessions.id = :studySessionId`, { studySessionId })
      .orderBy({ "startTime": "ASC" })
      .getMany();
  }


  async findShiftsByWeekDay(weekDay: Weekday): Promise<Shift[]> {
    return await Shift.createQueryBuilder('shift')
      .setLock("pessimistic_read")
      .useTransaction(true)
      .where(`shift.weekDay = :weekDay`, { weekDay })
      .orderBy({ "startTime": "ASC" })
      .getMany();
  }


  async findAllShifts(): Promise<Shift[]> {
    return await Shift.createQueryBuilder('shift')
      .setLock("pessimistic_read")
      .useTransaction(true)
      .getMany();
  }
}

const ShiftRepository = new ShiftRepositoryImpl();
export default ShiftRepository;