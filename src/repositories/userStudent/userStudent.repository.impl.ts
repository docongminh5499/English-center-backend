import { UserStudent } from "../../entities/UserStudent";
import Pageable from "../helpers/pageable";
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

  async findStudents(pageable: Pageable, query?: string): Promise<UserStudent[]> {
    let queryStmt = UserStudent
      .createQueryBuilder("student")
      .setLock("pessimistic_read")
      .useTransaction(true)
      .leftJoinAndSelect("student.user", "user")
      .orderBy("user.fullName", "ASC");
    if (query !== undefined && query.trim().length > 0)
      queryStmt = queryStmt.where("user.fullName LIKE :query", { query: '%' + query + '%' })
        .orWhere("user.id LIKE :query", { query: '%' + query + '%' })
    queryStmt = pageable.buildQuery(queryStmt);
    return await queryStmt.getMany();
  }

  async countStudents(query?: string): Promise<number> {
    let queryStmt = UserStudent
      .createQueryBuilder("student")
      .setLock("pessimistic_read")
      .useTransaction(true)
      .leftJoinAndSelect("student.user", "user");
    if (query !== undefined && query.trim().length > 0)
      queryStmt = queryStmt.where("user.fullName LIKE :query", { query: '%' + query + '%' })
        .orWhere("user.id LIKE :query", { query: '%' + query + '%' })
    return await queryStmt.getCount();
  }
}

const UserStudentRepository = new UserStudentRepositoryImpl();
export default UserStudentRepository;