import { UserStudent } from "../../entities/UserStudent";
import UserStudentRepositoryInterface from "./userStudent.repository.interface";

class UserStudentRepositoryImpl implements UserStudentRepositoryInterface {
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