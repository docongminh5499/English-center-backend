import { UserStudent } from "../../entities/UserStudent";
import UserStudentRepositoryInterface from "./userStudent.repository.interface";


class UserStudentRepositoryImpl implements UserStudentRepositoryInterface {
  async findStudentById(studentId: number): Promise<UserStudent | null> {
    return await UserStudent.createQueryBuilder("us")
      .setLock("pessimistic_read")
      .useTransaction(true)
      .leftJoinAndSelect("us.user", "user")
      .leftJoinAndSelect("us.userParent", "userParent")
      .leftJoinAndSelect("userParent.user", "parent")
      .where("user.id = :studentId", { studentId })
      .getOne();
  }
  async findUserStudentById(userId: number): Promise<UserStudent | null> {
    return await UserStudent.createQueryBuilder("student")
      .leftJoinAndSelect("student.userParent", "userParent")
      .leftJoinAndSelect("student.user", "user")
      .where("user.id = :userId", { userId })
      .getOne();
  }
}

const UserStudentRepository = new UserStudentRepositoryImpl();
export default UserStudentRepository;