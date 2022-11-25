import moment = require("moment");
import { StudentParticipateCourse } from "../../entities/StudentParticipateCourse";
import { UserStudent } from "../../entities/UserStudent";
import { NotFoundError } from "../../utils/errors/notFound.error";
import Pageable from "../helpers/pageable";
import TransactionConstantsRepository from "../transactionConstants/transactionConstants.repository.impl";
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


  async getLateFeeStudent(branchId: number, pageable: Pageable): Promise<UserStudent[]> {
    const constants = await TransactionConstantsRepository.find();
    if (constants === null) throw new NotFoundError();
    // Find latest fee due date
    const today = new Date();
    // Calculate fee date
    const feeDate = new Date(today.getFullYear(), today.getMonth(), constants.feeDay);
    if (feeDate > today)
      feeDate.setMonth(feeDate.getMonth() - 1);
    // Calculate fee due date
    const feeDueDate = new Date(feeDate);
    feeDueDate.setDate(feeDueDate.getDate() + constants.feeDueDay - constants.feeDay);
    if (feeDueDate < feeDate)
      feeDueDate.setMonth(feeDueDate.getMonth() + 1);
    // Caculate minimum valid fee date
    if (today < feeDueDate)
      feeDate.setMonth(feeDate.getMonth() - 1);
    // Query data
    let lateStudentQuery = StudentParticipateCourse.createQueryBuilder('studentPaticipateCourses')
      .setLock("pessimistic_read")
      .useTransaction(true)
      .select("studentPaticipateCourses.studentId", "id")
      .distinct(true)
      .leftJoin("studentPaticipateCourses.student", "student")
      .leftJoin("student.user", "userStudent")
      .leftJoin("studentPaticipateCourses.course", "course")
      .leftJoin("course.branch", "branch")
      .where("branch.id = :branchId", { branchId })
      .andWhere("course.expectedClosingDate > studentPaticipateCourses.billingDate")
      .andWhere("studentPaticipateCourses.billingDate <= :date", { date: moment(feeDate).format("YYYY-MM-DD") })
    let queryStmt = UserStudent.createQueryBuilder("s")
      .setLock("pessimistic_read")
      .useTransaction(true)
      .leftJoinAndSelect("s.user", "user")
      .where(`user.id IN (${lateStudentQuery.getQuery()})`)
      .setParameters(lateStudentQuery.getParameters())
    queryStmt = pageable.buildQuery(queryStmt);
    return await queryStmt.getMany();
  }


  async countLateFeeStudent(branchId: number): Promise<number> {
    const constants = await TransactionConstantsRepository.find();
    if (constants === null) throw new NotFoundError();
    // Find latest fee due date
    const today = new Date();
    // Calculate fee date
    const feeDate = new Date(today.getFullYear(), today.getMonth(), constants.feeDay);
    if (feeDate > today)
      feeDate.setMonth(feeDate.getMonth() - 1);
    // Calculate fee due date
    const feeDueDate = new Date(feeDate);
    feeDueDate.setDate(feeDueDate.getDate() + constants.feeDueDay - constants.feeDay);
    if (feeDueDate < feeDate)
      feeDueDate.setMonth(feeDueDate.getMonth() + 1);
    // Caculate minimum valid fee date
    if (today < feeDueDate)
      feeDate.setMonth(feeDate.getMonth() - 1);
    // Query data
    let lateStudentQuery = StudentParticipateCourse.createQueryBuilder('studentPaticipateCourses')
      .setLock("pessimistic_read")
      .useTransaction(true)
      .select("studentPaticipateCourses.studentId", "id")
      .distinct(true)
      .leftJoin("studentPaticipateCourses.student", "student")
      .leftJoin("student.user", "userStudent")
      .leftJoin("studentPaticipateCourses.course", "course")
      .leftJoin("course.branch", "branch")
      .where("branch.id = :branchId", { branchId })
      .andWhere("course.expectedClosingDate > studentPaticipateCourses.billingDate")
      .andWhere("studentPaticipateCourses.billingDate <= :date", { date: moment(feeDate).format("YYYY-MM-DD") })
    let queryStmt = UserStudent.createQueryBuilder("s")
      .setLock("pessimistic_read")
      .useTransaction(true)
      .leftJoinAndSelect("s.user", "user")
      .where(`user.id IN (${lateStudentQuery.getQuery()})`)
      .setParameters(lateStudentQuery.getParameters())
    return await queryStmt.getCount();
  }
}

const UserStudentRepository = new UserStudentRepositoryImpl();
export default UserStudentRepository;