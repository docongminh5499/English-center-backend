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
}

const UserTeacherRepository = new UserTeacherRepositoryImpl();
export default UserTeacherRepository;