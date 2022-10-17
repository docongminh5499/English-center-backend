import { Classroom } from "../../entities/Classroom";
import { StudySession } from "../../entities/StudySession";
import { ClassroomFunction } from "../../utils/constants/classroom.constant";
import ClassroomRepositoryInterface from "./classroom.repository.interface";

class ClassroomRepositoryImpl implements ClassroomRepositoryInterface {
  async findClassroomAvailable(branchId: number, beginingDate: Date, shiftIds: number[]): Promise<Classroom[]> {
    const busyClassroomIdsOfClassroomQuery = StudySession.createQueryBuilder("ss")
      .leftJoinAndSelect("ss.shifts", "shifts")
      .leftJoinAndSelect("ss.classroom", "classroom")
      .leftJoinAndSelect("classroom.branch", "branch")
      .select("classroom.name", "name")
      .addSelect("branch.id", "branchId")
      .distinct(true)
      .where("ss.date >= :beginingDate", { beginingDate })
      .andWhere(`shifts.id IN (:...ids)`, { ids: shiftIds });

    const classroomQuery = Classroom.createQueryBuilder("cr")
      .leftJoinAndSelect("cr.branch", "branch")
      .where("branch.id = :branchId", { branchId })
      .andWhere(`(cr.name, branch.id) NOT IN (${busyClassroomIdsOfClassroomQuery.getQuery()})`)
      .andWhere(`cr.function = '${ClassroomFunction.CLASSROOM}'`)
      .setParameters(busyClassroomIdsOfClassroomQuery.getParameters());
    return await classroomQuery.getMany();
  }
}


const ClassroomRepository = new ClassroomRepositoryImpl();
export default ClassroomRepository;