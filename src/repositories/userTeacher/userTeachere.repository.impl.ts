import { UserTeacher } from "../../entities/UserTeacher";
import UserTeacherRepositoryInterface from "./userTeacher.repository.interface";

class UserTeacherRepositoryImpl implements UserTeacherRepositoryInterface {
  async findUserTeacherByid(userId: number): Promise<UserTeacher | null> {
    return await UserTeacher.createQueryBuilder("teacher")
      .leftJoinAndSelect("teacher.worker", "worker")
      .leftJoinAndSelect("worker.user", "user")
      .leftJoinAndSelect("worker.branch", "branch")
      .where("user.id = :userId", { userId })
      .getOne();
  }
}

const UserTeacherRepository = new UserTeacherRepositoryImpl();
export default UserTeacherRepository;