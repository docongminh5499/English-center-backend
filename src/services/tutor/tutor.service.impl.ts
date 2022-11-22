import { validate } from "class-validator";
import { CourseDetailDto, CourseListDto, CredentialDto, FileDto, NotificationDto, NotificationResponseDto, PageableDto } from "../../dto";
import { Course } from "../../entities/Course";
import { Shift } from "../../entities/Shift";
import { UserTutor } from "../../entities/UserTutor";
import { AccountRepository, CourseRepository, Pageable, Sortable } from "../../repositories";
import ShiftRepository from "../../repositories/shift/shift.repository.impl";
import TutorRepository from "../../repositories/userTutor/tutor.repository.impl";
import Queryable from "../../utils/common/queryable.interface";
import { AVATAR_DESTINATION_SRC } from "../../utils/constants/avatar.constant";
import { InvalidVersionColumnError } from "../../utils/errors/invalidVersionColumn.error";
import { NotFoundError } from "../../utils/errors/notFound.error";
import { ValidationError } from "../../utils/errors/validation.error";
import { AppDataSource } from "../../utils/functions/dataSource";
import TutorServiceInterface from "./tutor.service.interface";
import * as path from "path";
import * as fs from "fs";
import * as jwt from "jsonwebtoken";
import moment = require("moment");
import { StudySession } from "../../entities/StudySession";
import StudySessionRepository from "../../repositories/studySession/studySession.repository.impl";
import { UserStudent } from "../../entities/UserStudent";
import StudentParticipateCourseRepository from "../../repositories/studentParticipateCourse/studentParticipateCourse.repository.impl";
import { UserEmployee } from "../../entities/UserEmployee";
import { UserAttendStudySession } from "../../entities/UserAttendStudySession";
import { MakeUpLession } from "../../entities/MakeUpLession";
import { getStudySessionState } from "../../utils/functions/getStudySessionState";
import { StudySessionState } from "../../utils/constants/studySessionState.constant";
import UserAttendStudySessionRepository from "../../repositories/userAttendStudySession/userAttendStudySession.repository.impl";
import MakeUpLessionRepository from "../../repositories/makeUpLesson/makeUpLesson.repository.impl";
import UserStudentRepository from "../../repositories/userStudent/userStudent.repository.impl";
import { slugify } from "../../utils/functions/slugify";
import { QueryRunner } from "typeorm";
import { User } from "../../entities/UserEntity";
import { Notification } from "../../entities/Notification";
import { SystemError } from "../../utils/errors/system.error";
import { io } from "../../socket";
import SalaryRepository from "../../repositories/salary/salary.repository.impl";
import { Salary } from "../../entities/Salary";

class TutorServiceImpl implements TutorServiceInterface {
  async getCoursesByTutor(tutorId: number, pageableDto: PageableDto, queryable: Queryable<Course>): Promise<CourseListDto> {
    const sortable = new Sortable()
      .add("openingDate", "DESC")
      .add("Course.name", "ASC");
    const pageable = new Pageable(pageableDto);
    const [courseCount, courseList] = await Promise.all([
      CourseRepository.countCourseByTutor(queryable, tutorId),
      CourseRepository.findCourseByTutor(pageable, sortable, queryable, tutorId)
    ]);
    const courseListDto = new CourseListDto();
    courseListDto.courses = courseList;
    courseListDto.limit = pageable.limit;
    courseListDto.skip = pageable.offset;
    courseListDto.total = courseCount;
    return courseListDto;
  }


  async getAllShifts(tutorId?: number): Promise<Shift[]> {
    if (tutorId === undefined) return [];
    return await ShiftRepository.findAllShifts();
  }


  async getFreeShifts(tutorId?: number): Promise<Shift[]> {
    if (tutorId === undefined) return [];
    return await TutorRepository.findFreeShiftsOfTutor(tutorId);
  }


  async updateFreeShifts(tutorId?: number, shiftIds?: number[]): Promise<void> {
    if (tutorId === undefined || shiftIds === undefined || shiftIds === null)
      throw new NotFoundError();
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect()
    await queryRunner.startTransaction()
    try {
      const tutor = await queryRunner.manager
        .createQueryBuilder(UserTutor, "tt")
        .setLock("pessimistic_write")
        .useTransaction(true)
        .leftJoinAndSelect("tt.shifts", "shifts")
        .where("tt.tutorId = :id", { id: tutorId })
        .getOne();
      if (tutor === null) throw new NotFoundError();
      const shifts = await queryRunner.manager
        .createQueryBuilder(Shift, "s")
        .setLock("pessimistic_write")
        .useTransaction(true)
        .where(`s.id IN (:...ids)`, { ids: shiftIds })
        .getMany();
      await queryRunner.manager
        .createQueryBuilder()
        .relation(UserTutor, "shifts")
        .of(tutor)
        .addAndRemove(shifts, tutor.shifts);
      await queryRunner.commitTransaction();
      await queryRunner.release();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      throw error;
    }
  }


  async getPersonalInformation(userId: number): Promise<UserTutor> {
    if (userId === undefined)
      throw new NotFoundError();
    const userTutor = await TutorRepository.findTutorById(userId);
    if (userTutor === null)
      throw new NotFoundError();
    return userTutor;
  }


  async modifyPersonalInformation(userId: number, userTutor: UserTutor, avatarFile?: FileDto | null): Promise<CredentialDto | null> {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect()
    await queryRunner.startTransaction()
    try {
      const persistenceUserTutor = await queryRunner.manager
        .createQueryBuilder(UserTutor, "tutor")
        .setLock("pessimistic_write")
        .useTransaction(true)
        .leftJoinAndSelect("tutor.worker", "worker")
        .leftJoinAndSelect("worker.user", "user")
        .leftJoinAndSelect("worker.branch", "branch")
        .where("user.id = :userId", { userId })
        .getOne();
      if (persistenceUserTutor === null) throw new NotFoundError();
      const oldAvatarSrc = persistenceUserTutor.worker.user.avatar;

      persistenceUserTutor.worker.user.fullName = userTutor.worker.user.fullName;
      persistenceUserTutor.worker.user.dateOfBirth = moment(userTutor.worker.user.dateOfBirth).toDate();
      persistenceUserTutor.worker.user.sex = userTutor.worker.user.sex;
      persistenceUserTutor.worker.passport = userTutor.worker.passport;
      persistenceUserTutor.worker.nation = userTutor.worker.nation;
      persistenceUserTutor.worker.homeTown = userTutor.worker.homeTown;
      persistenceUserTutor.worker.user.address = userTutor.worker.user.address;
      persistenceUserTutor.worker.user.email = userTutor.worker.user.email;
      persistenceUserTutor.worker.user.phone = userTutor.worker.user.phone;
      if (avatarFile && avatarFile.filename)
        persistenceUserTutor.worker.user.avatar = AVATAR_DESTINATION_SRC + avatarFile.filename;

      let slug = slugify(persistenceUserTutor.worker.user.fullName);
      const existedTutorByFullName = await queryRunner.manager
        .createQueryBuilder(UserTutor, "tt")
        .setLock("pessimistic_read")
        .useTransaction(true)
        .leftJoinAndSelect("tt.worker", "worker")
        .leftJoinAndSelect("worker.user", "user")
        .where("lower(user.fullName) = :fullName", { fullName: persistenceUserTutor.worker.user.fullName })
        .andWhere("tt.tutorId <> :id", { id: userId })
        .getCount();
      if (existedTutorByFullName > 0) slug = slug + "-" + existedTutorByFullName;
      persistenceUserTutor.slug = slug;

      if (persistenceUserTutor.version !== userTutor.version)
        throw new InvalidVersionColumnError();
      if (persistenceUserTutor.worker.version !== userTutor.worker.version)
        throw new InvalidVersionColumnError();
      if (persistenceUserTutor.worker.user.version !== userTutor.worker.user.version)
        throw new InvalidVersionColumnError();

      const userValidateErrors = await validate(persistenceUserTutor.worker.user);
      if (userValidateErrors.length) throw new ValidationError(userValidateErrors);
      const workerValidateErrors = await validate(persistenceUserTutor.worker);
      if (workerValidateErrors.length) throw new ValidationError(workerValidateErrors);
      const tutorValidateErrors = await validate(persistenceUserTutor);
      if (tutorValidateErrors.length) throw new ValidationError(tutorValidateErrors);

      const savedUser = await queryRunner.manager.save(persistenceUserTutor.worker.user);
      const savedWorker = await queryRunner.manager.save(persistenceUserTutor.worker);
      await queryRunner.manager.upsert(UserTutor, persistenceUserTutor, { conflictPaths: [], skipUpdateIfNoValuesChanged: true });
      await persistenceUserTutor.reload();

      if (persistenceUserTutor.version !== userTutor.version + 1
        && persistenceUserTutor.version !== userTutor.version)
        throw new InvalidVersionColumnError();
      if (savedWorker.version !== userTutor.worker.version + 1
        && savedWorker.version !== userTutor.worker.version)
        throw new InvalidVersionColumnError();
      if (savedUser.version !== userTutor.worker.user.version + 1
        && savedUser.version !== userTutor.worker.user.version)
        throw new InvalidVersionColumnError();

      await queryRunner.commitTransaction();
      await queryRunner.release();
      if (avatarFile && avatarFile.filename && oldAvatarSrc && oldAvatarSrc.length > 0) {
        const filePath = path.join(process.cwd(), "public", oldAvatarSrc);
        fs.unlinkSync(filePath);
      }

      const account = await AccountRepository.findByUserId(savedUser.id);
      const credentialDto = new CredentialDto();
      credentialDto.token = jwt.sign({
        fullName: account?.user.fullName,
        userId: account?.user.id,
        userName: account?.username,
        role: account?.role,
        avatar: account?.user.avatar,
        isManager: false,
        version: account?.version,
      }, process.env.TOKEN_KEY || "", { expiresIn: "1d" });
      return credentialDto;
    } catch (error) {
      console.log(error);
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      return null;
    }
  }


  async getSchedule(pageableDto: PageableDto, userId?: number, startDate?: Date, endDate?: Date): Promise<{ total: number, studySessions: StudySession[] }> {
    const result = { total: 0, studySessions: [] as StudySession[] }
    if (userId === undefined || startDate === undefined || endDate === undefined) return result;
    const pageable = new Pageable(pageableDto);
    result.studySessions = await StudySessionRepository.findStudySessionsByTutorId(userId, startDate, endDate, pageable);
    result.total = await StudySessionRepository.countStudySessionsByTutorId(userId, startDate, endDate);
    return result;
  }


  async getCourseDetail(tutorId: number, courseSlug: string): Promise<Partial<CourseDetailDto> | null> {
    const course = await CourseRepository.findCourseBySlug(courseSlug);
    if (course === null) return null;
    // Check permissions
    const courseIds = await StudySessionRepository.findCourseIdsByTutorId(tutorId);
    const foundId = courseIds.find(object => object.id === course.id);
    if (!foundId) return null;
    // Return data
    const courseDetail = new CourseDetailDto();
    courseDetail.version = course.version;
    courseDetail.id = course.id;
    courseDetail.slug = course.slug;
    courseDetail.name = course.name;
    courseDetail.maxNumberOfStudent = course.maxNumberOfStudent;
    courseDetail.price = course.price;
    courseDetail.openingDate = course.openingDate;
    courseDetail.closingDate = course.closingDate;
    courseDetail.expectedClosingDate = course.expectedClosingDate;
    courseDetail.image = course.image;
    courseDetail.curriculum = course.curriculum;
    courseDetail.teacher = course.teacher;
    courseDetail.branch = course.branch;
    return courseDetail;
  }

  async getStudents(userId: number, courseSlug: string,
    query: string, pageableDto: PageableDto): Promise<{ total: number, students: UserStudent[] }> {
    if (userId === undefined || courseSlug === undefined) return { total: 0, students: [] };
    const course = await CourseRepository.findCourseBySlug(courseSlug);
    if (course === null) return { total: 0, students: [] };

    const courseIds = await StudySessionRepository.findCourseIdsByTutorId(userId);
    const foundId = courseIds.find(object => object.id === course.id);
    if (!foundId) return { total: 0, students: [] };

    const pageable = new Pageable(pageableDto);
    const result = await StudentParticipateCourseRepository.findStudentsByCourseSlug(courseSlug, pageable, query);
    const total = await StudentParticipateCourseRepository.countStudentsByCourseSlug(courseSlug, query);

    return {
      total: total,
      students: result.map(r => r.student)
    };
  }


  async getStudentDetailsInCourse(userId: number, studentId: number, courseSlug: string): Promise<{ student: UserStudent }> {
    if (userId === undefined) throw new NotFoundError();
    const course = await CourseRepository.findCourseBySlug(courseSlug);
    if (course === null) throw new NotFoundError();

    const courseIds = await StudySessionRepository.findCourseIdsByTutorId(userId);
    const foundId = courseIds.find(object => object.id === course.id);
    if (!foundId) throw new ValidationError([]);
    if (!StudentParticipateCourseRepository.checkStudentParticipateCourse(studentId, courseSlug))
      throw new ValidationError([]);
    const student = await UserStudentRepository.findStudentById(studentId);
    if (student === null) throw new NotFoundError();
    return { student };
  }


  async getStudySessions(tutorId: number, courseSlug: string,
    pageableDto: PageableDto): Promise<{ total: number, studySessions: StudySession[] }> {
    if (tutorId === undefined) return { total: 0, studySessions: [] };
    const course = await CourseRepository.findCourseBySlug(courseSlug);
    if (course === null) return { total: 0, studySessions: [] };

    const courseIds = await StudySessionRepository.findCourseIdsByTutorId(tutorId);
    const foundId = courseIds.find(object => object.id === course.id);
    if (!foundId) return { total: 0, studySessions: [] };

    const pageable = new Pageable(pageableDto);
    const result = await StudySessionRepository.findStudySessionsByCourseSlugAndTutor(courseSlug, pageable, tutorId);
    const total = await StudySessionRepository.countStudySessionsByCourseSlugAndTutor(courseSlug, tutorId);
    return {
      total: total,
      studySessions: result,
    };
  }



  async getStudySessionDetail(tutorId?: number, studySessionId?: number):
    Promise<{ studySession: StudySession | null, attendences: UserAttendStudySession[], makeups: MakeUpLession[], ownMakeups: MakeUpLession[] }> {
    const result = {
      studySession: null as StudySession | null,
      attendences: [] as UserAttendStudySession[],
      makeups: [] as MakeUpLession[],
      ownMakeups: [] as MakeUpLession[],
    };
    if (tutorId === undefined || studySessionId === undefined) return result;
    result.studySession = await StudySessionRepository.findStudySessionById(studySessionId);
    if (result.studySession === null) return result;
    if (result.studySession.tutor.worker.user.id !== tutorId) {
      result.studySession = null;
      return result;
    }
    if (getStudySessionState(result.studySession) === StudySessionState.Ready) {
      result.studySession = null;
      return result;
    }
    const attendences = await UserAttendStudySessionRepository.findAttendenceByStudySessionId(studySessionId);
    if (attendences.length > 0) {
      const makeupsByStudySessions = await MakeUpLessionRepository.findByStudySessionId(studySessionId);
      const makeupsByTargetStudySessions = await MakeUpLessionRepository.findByTargetStudySessionId(studySessionId);
      result.attendences = attendences;
      result.makeups = makeupsByTargetStudySessions;
      result.ownMakeups = makeupsByStudySessions;
      return result;
    }

    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect()
    await queryRunner.startTransaction()

    try {
      let current = 0;
      const total = await StudentParticipateCourseRepository.countStudentsByCourseSlug(result.studySession.course.slug);
      while (current < total) {
        const pageable = new Pageable({ limit: 20, skip: current });
        const participations = await StudentParticipateCourseRepository.findStudentsByCourseSlug(result.studySession.course.slug, pageable);
        for (const participation of participations) {
          let userAttendStudySession = new UserAttendStudySession();
          userAttendStudySession.student = participation.student;
          userAttendStudySession.studySession = result.studySession;
          userAttendStudySession.commentOfTeacher = "";
          userAttendStudySession.isAttend = true;
          // Validation
          const validateErrors = await validate(userAttendStudySession);
          if (validateErrors.length) throw new ValidationError(validateErrors);
          await queryRunner.manager.save(userAttendStudySession);
        }
        current = current + participations.length;
      }
      await queryRunner.commitTransaction();
      await queryRunner.release();
      const attendences = await UserAttendStudySessionRepository.findAttendenceByStudySessionId(studySessionId);
      const makeupsByStudySessions = await MakeUpLessionRepository.findByStudySessionId(studySessionId);
      const makeupsByTargetStudySessions = await MakeUpLessionRepository.findByTargetStudySessionId(studySessionId);
      result.attendences = attendences;
      result.makeups = makeupsByTargetStudySessions;
      result.ownMakeups = makeupsByStudySessions;
      return result;
    } catch (error) {
      console.log(error);
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      result.studySession = null;
      return result;
    }
  }


  async sendNotification(queryRunner: QueryRunner, notificationDto: NotificationDto): Promise<NotificationResponseDto> {
    if (notificationDto.userId === undefined)
      throw new NotFoundError();
    if (notificationDto.content === undefined)
      throw new ValidationError([]);
    const foundUser = await queryRunner.manager
      .findOne(User, {
        where: { id: notificationDto.userId },
        relations: ["socketStatuses"],
        lock: { mode: "pessimistic_read" },
        transaction: true
      });
    if (foundUser == null) throw new NotFoundError();
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
      throw new SystemError();

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



  async requestOffStudySession(userId?: number, studySessionId?: number, excuse?: string): Promise<boolean> {
    if (userId === undefined || studySessionId === undefined || excuse === undefined)
      return false;
    const notifications: { socketIds: string[], notification: NotificationDto }[] = [];

    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect()
    await queryRunner.startTransaction();
    try {
      // Find tutor
      const tutor = await queryRunner.manager
        .createQueryBuilder(UserTutor, "tutor")
        .setLock("pessimistic_read")
        .useTransaction(true)
        .leftJoinAndSelect("tutor.worker", "worker")
        .leftJoinAndSelect("worker.user", "user")
        .where("user.id = :userId", { userId })
        .getOne();
      if (tutor === null) throw new NotFoundError();
      // Find study session
      const studySession = await queryRunner.manager
        .createQueryBuilder(StudySession, "ss")
        .setLock("pessimistic_read")
        .useTransaction(true)
        .leftJoinAndSelect("ss.shifts", "shifts")
        .leftJoinAndSelect("ss.course", "course")
        .leftJoinAndSelect("course.branch", "branch")
        .leftJoinAndSelect("ss.tutor", "tutor")
        .leftJoinAndSelect("tutor.worker", "worker")
        .leftJoinAndSelect("worker.user", "user")
        .where("ss.id = :studySessionId", { studySessionId })
        .orderBy({ "shifts.startTime": "ASC" })
        .getOne();
      if (studySession === null) throw new NotFoundError();
      // Check studySession is ready
      if (getStudySessionState(studySession) !== StudySessionState.Ready)
        throw new ValidationError([])
      // Check tutor
      if (studySession.tutor.worker.user.id !== userId)
        throw new ValidationError([])
      // Query employees by branch
      const employees = await queryRunner.manager
        .createQueryBuilder(UserEmployee, "employee")
        .setLock("pessimistic_read")
        .useTransaction(true)
        .leftJoinAndSelect("employee.worker", "worker")
        .leftJoinAndSelect("worker.user", "user")
        .leftJoinAndSelect("worker.branch", "branch")
        .where("branch.id = :branchId", { branchId: studySession.course.branch.id })
        .getMany();
      for (const employee of employees) {
        const notificationDto = {} as NotificationDto;
        notificationDto.userId = employee.worker.user.id;
        notificationDto.content =
          `Trợ giảng: ${tutor.worker.user.fullName}, MSTG: ${tutor.worker.user.id}.
        Yêu cầu nghỉ buổi học: ${studySession.name}, thuộc khóa học: ${studySession.course.name}. 
        Lý do: ${excuse}.`;
        const result = await this.sendNotification(queryRunner, notificationDto);
        if (result.success && result.receiverSocketStatuses && result.receiverSocketStatuses.length) {
          notifications.push({
            socketIds: result.receiverSocketStatuses.map(socketStatus => socketStatus.socketId),
            notification: result.notification
          });
        }
      }
      // Commit transaction
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
      return false;
    }
  }


  async getPersonalSalaries(userId: number, pageableDto: PageableDto, fromDate?: Date, toDate?: Date): Promise<{ total: number, salaries: Salary[] }> {
    if (userId === undefined || pageableDto === undefined || pageableDto === null) return { total: 0, salaries: [] };
    const pageable = new Pageable(pageableDto);
    const [total, salaries] = await Promise.all([
      SalaryRepository.countSalaryByUserId(userId, fromDate, toDate),
      SalaryRepository.findSalaryByUserId(userId, pageable, fromDate, toDate),
    ]);
    return { total, salaries };
  }
}


const TutorService = new TutorServiceImpl();
export default TutorService;