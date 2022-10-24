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
      .innerJoinAndSelect("teacher.curriculums", "curriculums")
      .where("branch.id = :branchId", { branchId })
      .andWhere("curriculums.id = :curriculumId", { curriculumId })
      .getMany();
  }
}

const UserTeacherRepository = new UserTeacherRepositoryImpl();
export default UserTeacherRepository;