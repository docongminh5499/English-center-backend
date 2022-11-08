import moment = require("moment");
import { StudySession } from "../../entities/StudySession";
import { UserTeacher } from "../../entities/UserTeacher";
import UserTeacherRepositoryInterface from "./userTeacher.repository.interface";

class UserTeacherRepositoryImpl implements UserTeacherRepositoryInterface {
  async findUserTeacherByid(userId: number): Promise<UserTeacher | null> {
    return await UserTeacher.createQueryBuilder("teacher")
      .setLock("pessimistic_read")
      .useTransaction(true)
      .leftJoinAndSelect("teacher.worker", "worker")
      .leftJoinAndSelect("worker.user", "user")
      .leftJoinAndSelect("worker.branch", "branch")
      .leftJoinAndSelect("branch.userEmployee", "manager")
      .leftJoinAndSelect("manager.worker", "managerWorker")
      .leftJoinAndSelect("managerWorker.user", "managerUser")
      .where("user.id = :userId", { userId })
      .getOne();
  }

  async findUserTeacherByBranchAndPreferedCurriculum(branchId: number, curriculumId: number): Promise<UserTeacher[]> {
    return await UserTeacher.createQueryBuilder("teacher")
      .setLock("pessimistic_read")
      .useTransaction(true)
      .leftJoinAndSelect("teacher.worker", "worker")
      .leftJoinAndSelect("worker.user", "user")
      .leftJoinAndSelect("worker.branch", "branch")
      .innerJoinAndSelect("teacher.preferredCurriculums", "preferredCurriculums")
      .innerJoinAndSelect("preferredCurriculums.curriculum", "curriculums")
      .where("branch.id = :branchId", { branchId })
      .andWhere("curriculums.id = :curriculumId", { curriculumId })
      .andWhere("curriculums.latest = true")
      .getMany();
  }


  async findPreferedCurriculums(teacherId: number): Promise<UserTeacher | null> {
    return await UserTeacher.createQueryBuilder("teacher")
      .setLock("pessimistic_read")
      .useTransaction(true)
      .leftJoinAndSelect("teacher.worker", "worker")
      .leftJoinAndSelect("worker.user", "user")
      .leftJoinAndSelect("teacher.preferredCurriculums", "preferredCurriculums")
      .leftJoinAndSelect("preferredCurriculums.curriculum", "curriculums")
      .where("user.id = :teacherId", { teacherId })
      .andWhere("curriculums.latest = true")
      .getOne();
  }


  async checkPreferredCurriculum(teacherId: number, curriculumId: number): Promise<boolean> {
    const result = await UserTeacher.createQueryBuilder("teacher")
      .setLock("pessimistic_read")
      .useTransaction(true)
      .leftJoinAndSelect("teacher.worker", "worker")
      .leftJoinAndSelect("worker.user", "user")
      .leftJoinAndSelect("teacher.preferredCurriculums", "preferredCurriculums")
      .leftJoinAndSelect("preferredCurriculums.curriculum", "curriculums")
      .where("user.id = :teacherId", { teacherId })
      .andWhere("curriculums.id = :curriculumId", { curriculumId })
      .andWhere("curriculums.latest = true")
      .getCount();
    return result > 0;
  }


  async findTeachersAvailableInDate(date: Date, shiftIds: number[], studySession: number, curriculumId: number, branchId?: number): Promise<UserTeacher[]> {
    const busyTeacherIdsQuery = StudySession.createQueryBuilder("ss")
      .setLock("pessimistic_read")
      .useTransaction(true)
      .leftJoinAndSelect("ss.shifts", "shifts")
      .leftJoinAndSelect("ss.teacher", "teacher")
      .leftJoinAndSelect("teacher.worker", "worker")
      .leftJoinAndSelect("worker.user", "userTeacher")
      .select("userTeacher.id", "id")
      .distinct(true)
      .where("ss.date = :date", { date: moment(date).format("YYYY-MM-DD") })
      .andWhere("ss.id <> :studySessionId", { studySessionId: studySession })
      .andWhere(`shifts.id IN (:...ids)`, { ids: shiftIds });

    let teacherQuery = UserTeacher.createQueryBuilder("tt")
      .setLock("pessimistic_read")
      .useTransaction(true)
      .leftJoinAndSelect("tt.worker", "worker")
      .leftJoinAndSelect("worker.user", "userTeacher")
      .leftJoinAndSelect("tt.preferredCurriculums", "preferredCurriculums")
      .leftJoinAndSelect("preferredCurriculums.curriculum", "curriculums")
    if (branchId !== undefined)
      teacherQuery = teacherQuery.leftJoinAndSelect("worker.branch", "branch");
    teacherQuery = teacherQuery.where(`userTeacher.id NOT IN (${busyTeacherIdsQuery.getQuery()})`)
      .andWhere("curriculums.id = :curriculumId", { curriculumId })
    if (branchId !== undefined)
      teacherQuery = teacherQuery.andWhere("branch.id = :branchId", { branchId })
    teacherQuery = teacherQuery.setParameters(busyTeacherIdsQuery.getParameters());
    return await teacherQuery.getMany();
  }
}

const UserTeacherRepository = new UserTeacherRepositoryImpl();
export default UserTeacherRepository;