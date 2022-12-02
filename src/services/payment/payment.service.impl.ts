import PaymentServiceInterface from "./payment.service.interface";
import StudentParticipateCourseRepository from "../../repositories/studentParticipateCourse/studentParticipateCourse.repository.impl";
import { CourseRepository } from "../../repositories";
import UserStudentRepository from "../../repositories/userStudent/userStudent.repository.impl";
import TransactionConstantsRepository from "../../repositories/transactionConstants/transactionConstants.repository.impl";
import { NotFoundError } from "../../utils/errors/notFound.error";
import { TermCourse } from "../../utils/constants/termCuorse.constant";
import { Course } from "../../entities/Course";
import { AppDataSource } from "../../utils/functions/dataSource";
import { UserStudent } from "../../entities/UserStudent";
import { StudentParticipateCourse } from "../../entities/StudentParticipateCourse";
import { DuplicateError } from "../../utils/errors/duplicate.error";
import { ValidationError } from "../../utils/errors/validation.error";
import { Transaction } from "../../entities/Transaction";
import { faker } from "@faker-js/faker";
import { TransactionType } from "../../utils/constants/transaction.constant";
import { validate } from "class-validator";
import { Fee } from "../../entities/Fee";
import { UserAttendStudySession } from "../../entities/UserAttendStudySession";
import { StudySession } from "../../entities/StudySession";
import { NotificationDto, NotificationResponseDto } from "../../dto";
import { QueryRunner } from "typeorm";
import { User } from "../../entities/UserEntity";
import { Notification } from "../../entities/Notification";
import { SystemError } from "../../utils/errors/system.error";
import { io } from "../../socket";
import fetch from "node-fetch";


const base = "https://api-m.sandbox.paypal.com";
const { CLIENT_ID, CLIENT_SECRET } = process.env;


class PaymentServiceImpl implements PaymentServiceInterface {

  private async getOrderDetail(orderId: string) {
    const accessToken = await this.generateAccessToken();
    const response = await fetch(`${base}/v2/checkout/orders/${orderId}`, {
      method: "get",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Accept-Language": "en_US",
        "Content-Type": "application/json",
      },
    });
    const data: any = await response.json();
    return data;
  }


  private async generateAccessToken() {
    const auth = Buffer.from(CLIENT_ID + ":" + CLIENT_SECRET).toString("base64");
    const response = await fetch(`${base}/v1/oauth2/token`, {
      method: "post",
      body: "grant_type=client_credentials",
      headers: {
        Authorization: `Basic ${auth}`,
      },
    });
    const data: any = await response.json();
    return data.access_token;
  }



  private diffDays(date1: Date, date2: Date): number {
    const diffTime: number = Math.abs((new Date(date2)).getTime() - (new Date(date1)).getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }



  private async caculateFeeAmount(course: Course): Promise<{ feeDate: Date, amount: number }> {
    let openingDate = new Date(course.openingDate);
    let expectedClosingDate = new Date(course.expectedClosingDate);
    let currentDate = new Date();
    if (currentDate <= openingDate) currentDate = openingDate;
    if (expectedClosingDate < currentDate) return { feeDate: expectedClosingDate, amount: 0 };
    // Find constants
    const constants = await TransactionConstantsRepository.find();
    if (constants === null) throw new NotFoundError("Không tìm thấy dữ liệu, vui lòng kiểm tra lại.");
    // Calculate feeDate
    let feeDate = null;
    if (course.curriculum.type == TermCourse.ShortTerm)
      feeDate = new Date(course.expectedClosingDate);
    else {
      // Find feeDate
      feeDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), constants.feeDay);
      if (feeDate <= currentDate)
        feeDate.setMonth(feeDate.getMonth() + 1);
      if (this.diffDays(feeDate, currentDate) < 10)
        feeDate.setMonth(feeDate.getMonth() + 1);
      if (course.expectedClosingDate <= feeDate)
        feeDate = new Date(course.expectedClosingDate);
      else if (this.diffDays(course.expectedClosingDate, feeDate) < 10)
        feeDate = new Date(course.expectedClosingDate);
    }
    return {
      feeDate: feeDate,
      amount: this.diffDays(feeDate, currentDate) / this.diffDays(course.expectedClosingDate, course.openingDate) * course.price,
    };
  }



  async sendNotification(queryRunner: QueryRunner, notificationDto: NotificationDto): Promise<NotificationResponseDto> {
    if (notificationDto.userId === undefined)
      throw new NotFoundError("Không tìm thấy thông tin người nhận thông báo.");
    if (notificationDto.content === undefined)
      throw new ValidationError(["Nội dung thông báo không hợp lệ, vui lòng kiểm tra lại."]);
    const foundUser = await queryRunner.manager
      .findOne(User, {
        where: { id: notificationDto.userId },
        relations: ["socketStatuses"],
        lock: { mode: "pessimistic_read" },
        transaction: true
      });
    if (foundUser == null) throw new NotFoundError("Không tìm thấy thông tin người nhận thông báo.");
    const response = new NotificationResponseDto();

    const notification = new Notification();
    notification.read = false;
    notification.content = notificationDto.content;
    notification.user = foundUser;
    notification.createdAt = new Date();

    const validateErrors = await validate(notification);
    if (validateErrors.length) throw new ValidationError(validateErrors);
    const savedNotification = await queryRunner.manager.save(notification);
    if (savedNotification === null || savedNotification.id === undefined || savedNotification.id === null)
      throw new SystemError("Gửi thông báo thất bại, vui lòng thử lại sau.");

    response.success = true;
    response.receiverSocketStatuses = foundUser.socketStatuses;
    response.notification = {
      id: savedNotification.id,
      content: savedNotification.content,
      read: savedNotification.read,
      userId: savedNotification.user.id,
      createdAt: savedNotification.createdAt
    };
    return response;
  }



  async getStudentOrderDetail(userId: number, courseSlug: string, parentId?: number): Promise<object> {
    // Check data
    if (userId === undefined || courseSlug === undefined) 
    throw new NotFoundError("Không tìm thấy thông tin, vui lòng kiểm tra lại.");
    // Check course
    const course = await CourseRepository.findCourseBySlug(courseSlug);
    if (course === null) throw new NotFoundError("Không tìm thấy khóa học.");
    // Check course isn't closed
    if (course.closingDate !== null && course.closingDate !== undefined)
      throw new ValidationError(["Khóa học đã kết thúc, không thể tham gia khóa học."]);
    // Check course doesn't start
    const today = new Date();
    if (today >= new Date(course.openingDate))
      throw new ValidationError(["Khóa học đã bắt đầu, không thể tham gia khóa học."]);
    // Check course is lock
    if (course.lockTime !== null && course.lockTime !== undefined)
      throw new ValidationError(["Khóa học đã bị khóa, không thể tham gia khóa học."]);
    // Check student
    const student = await UserStudentRepository.findStudentById(userId);
    if (student === null) throw new NotFoundError("Không tìm thấy thông tin của học viên.");
    // Check numberOfStudent
    const count = await StudentParticipateCourseRepository.countStudentsByCourseSlug(courseSlug);
    if (course.maxNumberOfStudent <= count)
      throw new ValidationError(["Khóa học đã đầy, vui lòng chọn khóa học khác."]);
    // Check parent
    if (parentId) {
      if (student.userParent === null || student.userParent.user.id !== parentId)
        throw new NotFoundError("Không tìm thấy thông tin phụ huynh.");
    }
    // Haven't participate course
    const participation = await StudentParticipateCourseRepository.findByStudentAndCourse(userId, courseSlug);
    if (participation !== null) throw new DuplicateError("Bạn đã tham gia khóa học này rồi, vui lòng chọn khóa học khác.");
    // Create orders
    const resultFee = await this.caculateFeeAmount(course);
    const createPaymentJson = {
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: "USD",
            value: (Math.ceil(resultFee.amount / 23000 * 100) / 100).toString(),
          },
        },
      ],
      application_context: {
        shipping_preference: "NO_SHIPPING",
      },
    };
    return { createPaymentJson, amount: resultFee.amount };
  }


  async onSuccessStudentParticipateCourse(studentId: number, courseSlug: string, orderId: string): Promise<boolean> {
    const notifications: { socketIds: string[], notification: NotificationDto }[] = [];
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect()
    await queryRunner.startTransaction();

    try {
      if (studentId === undefined || courseSlug === undefined || orderId === undefined)
        throw new NotFoundError("Dữ liệu không hợp lệ, vui lòng kiểm tra lại.");
      // Find order
      const data: any = await this.getOrderDetail(orderId);
      if (data === undefined || data === null || data.status !== "COMPLETED")
        throw new NotFoundError("Dữ liệu thanh toán không hợp lệ, vui lòng kiểm tra lại.");
      // Find course
      const course = await queryRunner.manager
        .createQueryBuilder(Course, "course")
        .setLock("pessimistic_read")
        .useTransaction(true)
        .leftJoinAndSelect("course.branch", "branch")
        .leftJoinAndSelect("course.teacher", "teacher")
        .leftJoinAndSelect("teacher.worker", "worker")
        .leftJoinAndSelect("worker.user", "userTeacher")
        .leftJoinAndSelect("course.curriculum", "curriculum")
        .leftJoinAndSelect("branch.userEmployee", "manager")
        .leftJoinAndSelect("manager.worker", "managerWorker")
        .leftJoinAndSelect("managerWorker.user", "managerUser")
        .where("course.slug = :courseSlug", { courseSlug })
        .getOne();
      if (course === null) throw new NotFoundError("Không tìm thấy thông tin khóa học.");
      // Check course isn't closed
      if (course.closingDate !== null && course.closingDate !== undefined)
        throw new ValidationError(["Khóa học đã kết thúc, không thể tham gia khóa học."]);
      // Check course doesn't start
      const today = new Date();
      if (today >= new Date(course.openingDate))
        throw new ValidationError(["Khóa học đã bắt đầu, không thể tham gia khóa học."]);
      // Check course is lock
      if (course.lockTime !== null && course.lockTime !== undefined)
        throw new ValidationError(["Khóa học đã bị khóa, không thể tham gia khóa học."]);
      // Find student
      const student = await queryRunner.manager
        .createQueryBuilder(UserStudent, "student")
        .setLock("pessimistic_read")
        .useTransaction(true)
        .leftJoinAndSelect("student.user", "user")
        .where("user.id = :studentId", { studentId })
        .getOne();
      if (student === null) throw new NotFoundError("Không tìm thấy thông tin của học viên.");
      //Check student participate course
      const participations = await queryRunner.manager
        .createQueryBuilder(StudentParticipateCourse, 'studentPaticipateCourses')
        .setLock("pessimistic_write")
        .useTransaction(true)
        .leftJoinAndSelect("studentPaticipateCourses.student", "student")
        .leftJoinAndSelect("student.user", "userStudent")
        .leftJoinAndSelect("studentPaticipateCourses.course", "course")
        .where("course.slug = :courseSlug", { courseSlug })
        .getMany();
      const found = participations.find(s => s.student.user.id === studentId)
      if (found) throw new DuplicateError("Bạn đã tham gia khóa học này rồi, vui lòng chọn khóa học khác.");
      // Check max student number
      if (course.maxNumberOfStudent <= participations.length)
        throw new ValidationError(["Khóa học đã đầy, vui lòng chọn khóa học khác."]);
      // Add participation
      const studentParticipateCourse = new StudentParticipateCourse();
      studentParticipateCourse.student = student;
      studentParticipateCourse.course = course;
      // Transaction
      const resultFee = await this.caculateFeeAmount(course);
      const transaction = new Transaction();
      transaction.transCode = faker.random.numeric(16);
      transaction.content = course.curriculum.type === TermCourse.LongTerm
        ? `Tiền học phí tháng ${resultFee.feeDate.getMonth() + 1}`
        : `Tiền học phí khóa học ${course.name}`;
      transaction.amount = resultFee.amount;
      transaction.type = TransactionType.Fee;
      transaction.branch = course.branch;
      transaction.payDate = new Date();
      transaction.userEmployee = course.branch.userEmployee;
      // Validate entity
      const transValidateErrors = await validate(transaction);
      if (transValidateErrors.length) throw new ValidationError(transValidateErrors);
      // Save data
      const savedTransaction = await queryRunner.manager.save(transaction);
      // Create free
      const fee = new Fee();
      fee.transCode = savedTransaction;
      fee.userStudent = student;
      fee.course = course;
      // Validate entity
      const feeValidateErrors = await validate(fee);
      if (feeValidateErrors.length) throw new ValidationError(feeValidateErrors);
      // Save data
      await queryRunner.manager.save(fee);
      studentParticipateCourse.billingDate = new Date(resultFee.feeDate);
      // Add user attend study session
      const attendanceQuery = queryRunner.manager
        .createQueryBuilder(UserAttendStudySession, "uas")
        .setLock("pessimistic_write")
        .useTransaction(true)
        .select("studySession.id", "id")
        .distinct(true)
        .innerJoin("uas.studySession", "studySession")
        .innerJoin("studySession.course", "course")
        .where("course.slug = :courseSlug", { courseSlug })
        .andWhere("studySession.date > CURDATE()");
      const studySessions = await queryRunner.manager
        .createQueryBuilder(StudySession, "ss")
        .setLock("pessimistic_read")
        .useTransaction(true)
        .where(`ss.id IN (${attendanceQuery.getQuery()})`)
        .setParameters(attendanceQuery.getParameters())
        .getMany();
      for (const studySession of studySessions) {
        const attendance = new UserAttendStudySession();
        attendance.student = student;
        attendance.studySession = studySession;
        attendance.commentOfTeacher = "";
        attendance.isAttend = true;
        // Validate
        const validateErrors = await validate(attendance);
        if (validateErrors.length) throw new ValidationError(validateErrors);
        // Save
        await queryRunner.manager.save(attendance);
      }
      // Student notification
      const studentNotificationDto = {} as NotificationDto;
      studentNotificationDto.userId = student.user.id;
      studentNotificationDto.content = `Bạn vừa được thêm vào khoá học "${course.name}". Vui lòng vào trang web để kiểm tra thông tin.`;
      const studentNotificationResult = await this.sendNotification(queryRunner, studentNotificationDto);
      if (studentNotificationResult.success && studentNotificationResult.receiverSocketStatuses && studentNotificationResult.receiverSocketStatuses.length) {
        notifications.push({
          socketIds: studentNotificationResult.receiverSocketStatuses.map(socketStatus => socketStatus.socketId),
          notification: studentNotificationResult.notification
        });
      }
      // Validation
      const validateErrors = await validate(studentParticipateCourse);
      if (validateErrors.length) throw new ValidationError(validateErrors);
      // Commit 
      await queryRunner.manager.save(studentParticipateCourse);
      await queryRunner.commitTransaction();
      await queryRunner.release();
      // Send notifications
      notifications.forEach(notification => {
        notification.socketIds.forEach(id => {
          io.to(id).emit("notification", notification.notification);
        });
      });
      return true;
    } catch (error) {
      console.log(error);
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      throw error;
    }
  }

  async studentPayment(studentId: number, courseSlug: string,  orderId: string) : Promise<boolean>{
    const notifications: { socketIds: string[], notification: NotificationDto }[] = [];
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect()
    await queryRunner.startTransaction();
    try {
      if (studentId === undefined || courseSlug === undefined || orderId === undefined)
        throw new NotFoundError("Dữ liệu không hợp lệ, vui lòng kiểm tra lại.");
      // Find order
      const data: any = await this.getOrderDetail(orderId);
      if (data === undefined || data === null || data.status !== "COMPLETED")
        throw new NotFoundError("Dữ liệu thanh toán không hợp lệ, vui lòng kiểm tra lại.");
      // Find course
      const course = await queryRunner.manager
        .createQueryBuilder(Course, "course")
        .setLock("pessimistic_read")
        .useTransaction(true)
        .leftJoinAndSelect("course.branch", "branch")
        .leftJoinAndSelect("course.teacher", "teacher")
        .leftJoinAndSelect("teacher.worker", "worker")
        .leftJoinAndSelect("worker.user", "userTeacher")
        .leftJoinAndSelect("course.curriculum", "curriculum")
        .leftJoinAndSelect("branch.userEmployee", "manager")
        .leftJoinAndSelect("manager.worker", "managerWorker")
        .leftJoinAndSelect("managerWorker.user", "managerUser")
        .where("course.slug = :courseSlug", { courseSlug })
        .getOne();
      if (course === null) throw new NotFoundError("Không tìm thấy thông tin khóa học.");
      // Check course isn't closed
      if (course.closingDate !== null && course.closingDate !== undefined)
        throw new ValidationError(["Khóa học đã kết thúc, không thể tham gia khóa học."]);
      // Check course doesn't start
      const today = new Date();
      if (today >= new Date(course.openingDate))
        throw new ValidationError(["Khóa học đã bắt đầu, không thể tham gia khóa học."]);
      // Check course is lock
      if (course.lockTime !== null && course.lockTime !== undefined)
        throw new ValidationError(["Khóa học đã bị khóa, không thể tham gia khóa học."]);
      // Find student
      const student = await queryRunner.manager
        .createQueryBuilder(UserStudent, "student")
        .setLock("pessimistic_read")
        .useTransaction(true)
        .leftJoinAndSelect("student.user", "user")
        .where("user.id = :studentId", { studentId })
        .getOne();
      if (student === null) throw new NotFoundError("Không tìm thấy thông tin của học viên.");
      //Check student participate course
      const studentParticipateCourse = await queryRunner.manager
        .createQueryBuilder(StudentParticipateCourse, 'studentPaticipateCourses')
        .setLock("pessimistic_write")
        .useTransaction(true)
        .leftJoinAndSelect("studentPaticipateCourses.student", "student")
        .leftJoinAndSelect("student.user", "userStudent")
        .leftJoinAndSelect("studentPaticipateCourses.course", "course")
        .where("course.slug = :courseSlug", { courseSlug })
        .andWhere("userStudent.id = :studentId", {studentId})
        .getOne();
      // const found = participations.find(s => s.student.user.id === studentId)
      // if (found) throw new DuplicateError("Bạn đã tham gia khóa học này rồi, vui lòng chọn khóa học khác.");
      // Check max student number
      // if (course.maxNumberOfStudent <= participations.length)
      //   throw new ValidationError(["Khóa học đã đầy, vui lòng chọn khóa học khác."]);
      // Add participation
      // const studentParticipateCourse = new StudentParticipateCourse();
      // studentParticipateCourse.student = student;
      // studentParticipateCourse.course = course;
      // Transaction
      const resultFee = await this.caculateFeeAmount(course);
      const transaction = new Transaction();
      transaction.transCode = faker.random.numeric(16);
      transaction.content = course.curriculum.type === TermCourse.LongTerm
        ? `${course.name} (${resultFee.feeDate.getMonth() + 1})`
        : `Tiền học phí khóa học ${course.name}`;
      transaction.amount = resultFee.amount;
      transaction.type = TransactionType.Fee;
      transaction.branch = course.branch;
      transaction.payDate = new Date();
      transaction.userEmployee = course.branch.userEmployee;
      // Validate entity
      const transValidateErrors = await validate(transaction);
      if (transValidateErrors.length) throw new ValidationError(transValidateErrors);
      // Save data
      const savedTransaction = await queryRunner.manager.save(transaction);
      // Create free
      const fee = new Fee();
      fee.transCode = savedTransaction;
      fee.userStudent = student;
      fee.course = course;
      // Validate entity
      const feeValidateErrors = await validate(fee);
      if (feeValidateErrors.length) throw new ValidationError(feeValidateErrors);
      // Save data
      await queryRunner.manager.save(fee);
      studentParticipateCourse!.billingDate = new Date(resultFee.feeDate);
      // Add user attend study session
      const attendanceQuery = queryRunner.manager
        .createQueryBuilder(UserAttendStudySession, "uas")
        .setLock("pessimistic_write")
        .useTransaction(true)
        .select("studySession.id", "id")
        .distinct(true)
        .innerJoin("uas.studySession", "studySession")
        .innerJoin("studySession.course", "course")
        .where("course.slug = :courseSlug", { courseSlug })
        .andWhere("studySession.date > CURDATE()");
      const studySessions = await queryRunner.manager
        .createQueryBuilder(StudySession, "ss")
        .setLock("pessimistic_read")
        .useTransaction(true)
        .where(`ss.id IN (${attendanceQuery.getQuery()})`)
        .setParameters(attendanceQuery.getParameters())
        .getMany();
      for (const studySession of studySessions) {
        const attendance = new UserAttendStudySession();
        attendance.student = student;
        attendance.studySession = studySession;
        attendance.commentOfTeacher = "";
        attendance.isAttend = true;
        // Validate
        const validateErrors = await validate(attendance);
        if (validateErrors.length) throw new ValidationError(validateErrors);
        // Save
        await queryRunner.manager.save(attendance);
      }
      // Student notification
      const studentNotificationDto = {} as NotificationDto;
      studentNotificationDto.userId = student.user.id;
      studentNotificationDto.content = `Bạn vừa được thêm vào khoá học "${course.name}". Vui lòng vào trang web để kiểm tra thông tin.`;
      const studentNotificationResult = await this.sendNotification(queryRunner, studentNotificationDto);
      if (studentNotificationResult.success && studentNotificationResult.receiverSocketStatuses && studentNotificationResult.receiverSocketStatuses.length) {
        notifications.push({
          socketIds: studentNotificationResult.receiverSocketStatuses.map(socketStatus => socketStatus.socketId),
          notification: studentNotificationResult.notification
        });
      }
      // Validation
      // const validateErrors = await validate(studentParticipateCourse!);
      // if (validateErrors.length) throw new ValidationError(validateErrors);
      // // Commit 
      // await queryRunner.manager.save(studentParticipateCourse);
      await queryRunner.commitTransaction();
      await queryRunner.release();
      // Send notifications
      notifications.forEach(notification => {
        notification.socketIds.forEach(id => {
          io.to(id).emit("notification", notification.notification);
        });
      });
      return true;
    } catch (error) {
      console.log(error);
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      throw error;
    }
  }
}


const PaymentService = new PaymentServiceImpl();
export default PaymentService;