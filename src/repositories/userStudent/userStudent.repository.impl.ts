import { UserStudent } from "../../entities/UserStudent";
import UserStudentRepositoryInterface from "./userStudent.repository.interface";


class UserStudentRepositoryImpl implements UserStudentRepositoryInterface {
  async findStudentById(studentId: number): Promise<UserStudent | null> {
    return await UserStudent.createQueryBuilder("us")
      .leftJoinAndSelect("us.user", "user")
      .leftJoinAndSelect("us.userParent", "userParent")
      .leftJoinAndSelect("userParent.user", "parent")
      .where("user.id = :studentId", { studentId })
      .getOne();
  }
}

const UserStudentRepository = new UserStudentRepositoryImpl();
export default UserStudentRepository;