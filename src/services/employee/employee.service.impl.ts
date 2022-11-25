import { faker } from "@faker-js/faker";
import { validate } from "class-validator";
import moment = require("moment");
import { QueryRunner } from "typeorm";
import { ClassroomDto, CourseDetailDto, CourseListDto, CreateCourseDto, CredentialDto, FileDto, NotificationDto, NotificationResponseDto, PageableDto, StudySessionDto, UnpaidDto } from "../../dto";
import { Branch } from "../../entities/Branch";
import { Classroom } from "../../entities/Classroom";
import { Course } from "../../entities/Course";
import { Curriculum } from "../../entities/Curriculum";
import { MakeUpLession } from "../../entities/MakeUpLession";
import { Notification } from "../../entities/Notification";
import { Shift } from "../../entities/Shift";
import { StudentParticipateCourse } from "../../entities/StudentParticipateCourse";
import { StudySession } from "../../entities/StudySession";
import { UserEmployee } from "../../entities/UserEmployee";
import { User } from "../../entities/UserEntity";
import { UserStudent } from "../../entities/UserStudent";
import { UserTeacher } from "../../entities/UserTeacher";
import { UserTutor } from "../../entities/UserTutor";
import { AccountRepository, CourseRepository, Pageable, Selectable, SocketStatusRepository, Sortable } from "../../repositories";
import BranchRepository from "../../repositories/branch/branch.repository.impl";
import ClassroomRepository from "../../repositories/classroom/classroom.repository.impl";
import CurriculumRepository from "../../repositories/curriculum/curriculum.repository.impl";
import ShiftRepository from "../../repositories/shift/shift.repository.impl";
import StudySessionRepository from "../../repositories/studySession/studySession.repository.impl";
import EmployeeRepository from "../../repositories/userEmployee/employee.repository.impl";
import UserTeacherRepository from "../../repositories/userTeacher/userTeachere.repository.impl";
import TutorRepository from "../../repositories/userTutor/tutor.repository.impl";
import { io } from "../../socket";
import Queryable from "../../utils/common/queryable.interface";
import { ClassroomFunction } from "../../utils/constants/classroom.constant";
import { ACCEPTED_PERCENT_STUDENT_ATTENDANCE } from "../../utils/constants/common.constant";
import { COURSE_DESTINATION_SRC } from "../../utils/constants/course.constant";
import { cvtWeekDay2Num, getWeekdayFromDate } from "../../utils/constants/weekday.constant";
import { InvalidVersionColumnError } from "../../utils/errors/invalidVersionColumn.error";
import { NotFoundError } from "../../utils/errors/notFound.error";
import { SystemError } from "../../utils/errors/system.error";
import { ValidationError } from "../../utils/errors/validation.error";
import { AppDataSource } from "../../utils/functions/dataSource";
import { slugify } from "../../utils/functions/slugify";
import EmployeeServiceInterface from "./employee.service.interface";
import * as path from "path";
import * as fs from "fs";
import * as jwt from "jsonwebtoken";
import { AVATAR_DESTINATION_SRC } from "../../utils/constants/avatar.constant";
import { DuplicateError } from "../../utils/errors/duplicate.error";
import StudentParticipateCourseRepository from "../../repositories/studentParticipateCourse/studentParticipateCourse.repository.impl";
import UserStudentRepository from "../../repositories/userStudent/userStudent.repository.impl";
import { UserParent } from "../../entities/UserParent";
import UserParentRepository from "../../repositories/userParent/userParent.repository.impl";
import SalaryRepository from "../../repositories/salary/salary.repository.impl";
import { Salary } from "../../entities/Salary";
import { Fee } from "../../entities/Fee";
import { Refund } from "../../entities/Refund";
import FeeRepository from "../../repositories/fee/fee.repository.impl";
import RefundRepository from "../../repositories/refund/refund.repository.impl";
import { TermCourse } from "../../utils/constants/termCuorse.constant";
import { Transaction } from "../../entities/Transaction";
import { TransactionType } from "../../utils/constants/transaction.constant";
import { UserAttendStudySession } from "../../entities/UserAttendStudySession";
import { Lecture } from "../../entities/Lecture";
import TransactionConstantsRepository from "../../repositories/transactionConstants/transactionConstants.repository.impl";
import { TransactionConstants } from "../../entities/TransactionConstants";



class EmployeeServiceImpl implements EmployeeServiceInterface {
  async getPersonalInformation(userId: number): Promise<UserEmployee> {
    if (userId === undefined)
      throw new NotFoundError();
    const userEmployee = await EmployeeRepository.findUserEmployeeByid(userId);
    if (userEmployee === null)
      throw new NotFoundError();
    return userEmployee;
  }



  async modifyPersonalInformation(userId: number, userEmployee: UserEmployee, avatarFile?: FileDto | null): Promise<CredentialDto | null> {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect()
    await queryRunner.startTransaction()
    try {
      const persistenceUserEmployee = await queryRunner.manager
        .createQueryBuilder(UserEmployee, "employee")
        .setLock("pessimistic_write")
        .useTransaction(true)
        .leftJoinAndSelect("employee.worker", "worker")
        .leftJoinAndSelect("worker.user", "user")
        .leftJoinAndSelect("worker.branch", "branch")
        .where("user.id = :userId", { userId })
        .getOne();
      if (persistenceUserEmployee === null) throw new NotFoundError();
      const oldAvatarSrc = persistenceUserEmployee.worker.user.avatar;

      persistenceUserEmployee.worker.user.fullName = userEmployee.worker.user.fullName;
      persistenceUserEmployee.worker.user.dateOfBirth = moment(userEmployee.worker.user.dateOfBirth).toDate();
      persistenceUserEmployee.worker.user.sex = userEmployee.worker.user.sex;
      persistenceUserEmployee.worker.passport = userEmployee.worker.passport;
      persistenceUserEmployee.worker.nation = userEmployee.worker.nation;
      persistenceUserEmployee.worker.homeTown = userEmployee.worker.homeTown;
      persistenceUserEmployee.worker.user.address = userEmployee.worker.user.address;
      persistenceUserEmployee.worker.user.email = userEmployee.worker.user.email;
      persistenceUserEmployee.worker.user.phone = userEmployee.worker.user.phone;
      if (avatarFile && avatarFile.filename)
        persistenceUserEmployee.worker.user.avatar = AVATAR_DESTINATION_SRC + avatarFile.filename;
      if (persistenceUserEmployee.version !== userEmployee.version)
        throw new InvalidVersionColumnError();
      if (persistenceUserEmployee.worker.version !== userEmployee.worker.version)
        throw new InvalidVersionColumnError();
      if (persistenceUserEmployee.worker.user.version !== userEmployee.worker.user.version)
        throw new InvalidVersionColumnError();

      const userValidateErrors = await validate(persistenceUserEmployee.worker.user);
      if (userValidateErrors.length) throw new ValidationError(userValidateErrors);
      const workerValidateErrors = await validate(persistenceUserEmployee.worker);
      if (workerValidateErrors.length) throw new ValidationError(workerValidateErrors);
      const employeeValidateErrors = await validate(persistenceUserEmployee);
      if (employeeValidateErrors.length) throw new ValidationError(employeeValidateErrors);

      const savedUser = await queryRunner.manager.save(persistenceUserEmployee.worker.user);
      const savedWorker = await queryRunner.manager.save(persistenceUserEmployee.worker);
      await queryRunner.manager.upsert(UserEmployee, persistenceUserEmployee, { conflictPaths: [], skipUpdateIfNoValuesChanged: true });
      await persistenceUserEmployee.reload();

      if (persistenceUserEmployee.version !== userEmployee.version + 1
        && persistenceUserEmployee.version !== userEmployee.version)
        throw new InvalidVersionColumnError();
      if (savedWorker.version !== userEmployee.worker.version + 1
        && savedWorker.version !== userEmployee.worker.version)
        throw new InvalidVersionColumnError();
      if (savedUser.version !== userEmployee.worker.user.version + 1
        && savedUser.version !== userEmployee.worker.user.version)
        throw new InvalidVersionColumnError();

      await queryRunner.commitTransaction();
      await queryRunner.release();
      if (avatarFile && avatarFile.filename && oldAvatarSrc && oldAvatarSrc.length > 0) {
        const filePath = path.join(process.cwd(), "public", oldAvatarSrc);
        fs.unlinkSync(filePath);
      }

      const account = await AccountRepository.findByUserId(savedUser.id);
      const isManager = await BranchRepository.checkIsManager(savedUser.id);
      const credentialDto = new CredentialDto();
      credentialDto.token = jwt.sign({
        fullName: account?.user.fullName,
        userId: account?.user.id,
        userName: account?.username,
        role: account?.role,
        avatar: account?.user.avatar,
        isManager: isManager,
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



  async getCurriculumList(userId?: number): Promise<Curriculum[]> {
    if (userId === undefined) return [];
    return await CurriculumRepository.getCurriculumList();
  }



  async getBranches(userId?: number): Promise<Branch[]> {
    if (userId === undefined) return [];
    return await BranchRepository.findBranch();
  }


  async getTeacherByBranchAndPreferedCurriculum(userId?: number, branchId?: number, curriculumId?: number): Promise<UserTeacher[]> {
    if (userId === undefined || branchId === undefined || curriculumId === undefined) return [];
    return await UserTeacherRepository.findUserTeacherByBranchAndPreferedCurriculum(branchId, curriculumId);
  }


  async getTeacherFreeShifts(userId?: number, teacherId?: number, beginingDate?: Date, closingDate?: Date, courseSlug?: string): Promise<Shift[]> {
    if (userId === undefined || teacherId === undefined ||
      beginingDate === undefined || beginingDate === null) return [];
    return await ShiftRepository.findAvailableShiftsOfTeacher(teacherId, beginingDate, closingDate, courseSlug);
  }


  async getAvailableTutors(userId?: number, beginingDate?: Date, shiftIds?: number[], branchId?: number, closingDate?: Date, courseSlug?: string): Promise<UserTutor[]> {
    if (userId === undefined || shiftIds === undefined || beginingDate === undefined || beginingDate === null) return [];
    return await TutorRepository.findTutorsAvailable(beginingDate, shiftIds, branchId, closingDate, courseSlug);
  }


  async getAvailableClassroom(userId?: number, beginingDate?: Date, shiftIds?: number[], branchId?: number, closingDate?: Date, courseSlug?: string): Promise<Classroom[]> {
    if (userId === undefined || shiftIds === undefined ||
      beginingDate === undefined || beginingDate === null || branchId === undefined) return [];
    return await ClassroomRepository.findClassroomAvailable(branchId, beginingDate, shiftIds, closingDate, courseSlug);
  }



  async getCoursesByBranch(employeeId: number, pageableDto: PageableDto, queryable: Queryable<Course>): Promise<CourseListDto> {
    const employee = await EmployeeRepository.findUserEmployeeByid(employeeId);
    if (employee === null) throw new NotFoundError();
    const selectable = new Selectable()
      .add("Course.id", "id")
      .add("Course.image", "image")
      .add("closingDate", "closingDate")
      .add("Course.name", "name")
      .add("openingDate", "openingDate")
      .add("slug", "slug")
      .add("lockTime", "lockTime");
    const sortable = new Sortable()
      .add("openingDate", "DESC")
      .add("name", "ASC");
    const pageable = new Pageable(pageableDto);

    const [courseCount, courseList] = await Promise.all([
      CourseRepository.countCourseByBranch(queryable, employee.worker.branch.id),
      CourseRepository.findCourseByBranch(pageable, sortable, selectable, queryable, employee.worker.branch.id)
    ]);
    const courseListDto = new CourseListDto();
    courseListDto.courses = courseList;
    courseListDto.limit = pageable.limit;
    courseListDto.skip = pageable.offset;
    courseListDto.total = courseCount;
    return courseListDto;
  }



  async getCourseDetail(employeeId: number, courseSlug: string): Promise<Partial<CourseDetailDto> | null> {
    const employee = await EmployeeRepository.findUserEmployeeByid(employeeId);
    if (employee === null) throw new NotFoundError();

    const course = await CourseRepository.findCourseBySlug(courseSlug);
    if (course === null) throw new NotFoundError();
    if (course.branch.id !== employee.worker.branch.id) throw new NotFoundError();

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
    courseDetail.documents = course.documents;
    courseDetail.studySessions = course.studySessions;
    courseDetail.exercises = course.exercises;
    courseDetail.curriculum = course.curriculum;
    courseDetail.branch = course.branch;
    courseDetail.teacher = course.teacher;
    courseDetail.lockTime = course.lockTime;
    courseDetail.sessionPerWeek = course.sessionPerWeek;
    return courseDetail;
  }



  async getStudySessions(employeeId: number, courseSlug: string,
    pageableDto: PageableDto, query?: string): Promise<{ total: number, studySessions: StudySession[] }> {

    if (employeeId === undefined) return { total: 0, studySessions: [] };
    const employee = await EmployeeRepository.findUserEmployeeByid(employeeId);
    if (employee === null) throw new NotFoundError();

    const course = await CourseRepository.findCourseBySlug(courseSlug);
    if (course?.branch.id !== employee.worker.branch.id) return { total: 0, studySessions: [] };
    const pageable = new Pageable(pageableDto);
    const result = await StudySessionRepository.findStudySessionsByCourseSlugAndTeacher(courseSlug, pageable, undefined, query);
    const total = await StudySessionRepository.countStudySessionsByCourseSlugAndTeacher(courseSlug, undefined, query);

    return {
      total: total,
      studySessions: result,
    };
  }



  async createCourse(userId?: number, createCourseDto?: CreateCourseDto): Promise<Course | null> {
    if (userId === undefined || createCourseDto === undefined || createCourseDto === null) return null;
    if (createCourseDto.name === undefined ||
      createCourseDto.maxNumberOfStudent === undefined ||
      createCourseDto.price === undefined ||
      createCourseDto.openingDate === undefined ||
      createCourseDto.image === undefined ||
      createCourseDto.curriculum === undefined ||
      createCourseDto.teacher === undefined ||
      createCourseDto.branch === undefined)
      return null;

    const notifications: { socketIds: string[], notification: NotificationDto }[] = [];
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect()
    await queryRunner.startTransaction()

    try {
      // Check schedules
      if (createCourseDto.tutors === undefined ||
        createCourseDto.classrooms === undefined ||
        createCourseDto.shifts === undefined ||
        createCourseDto.tutors.length === 0 ||
        createCourseDto.classrooms.length === 0 ||
        createCourseDto.shifts.length === 0 ||
        createCourseDto.shifts.length !== createCourseDto.classrooms.length ||
        createCourseDto.shifts.length !== createCourseDto.tutors.length ||
        createCourseDto.classrooms.length !== createCourseDto.tutors.length)
        throw new ValidationError([]);
      // Course need to belong to the branch
      const employee = await EmployeeRepository.findUserEmployeeByid(userId);
      if (employee === null) throw new NotFoundError();
      if (employee.worker.branch.id !== createCourseDto.branch) throw new ValidationError([]);
      // Teacher want to teach the course
      const preferedTeachers = await queryRunner.manager
        .createQueryBuilder(UserTeacher, "teacher")
        .setLock("pessimistic_read")
        .useTransaction(true)
        .leftJoinAndSelect("teacher.worker", "worker")
        .leftJoinAndSelect("worker.user", "user")
        .innerJoinAndSelect("teacher.preferredCurriculums", "preferredCurriculums")
        .innerJoinAndSelect("preferredCurriculums.curriculum", "curriculums")
        .where("curriculums.id = :curriculumId", { curriculumId: createCourseDto.curriculum })
        .andWhere("curriculums.latest = true")
        .getMany();
      const foundTeacher = preferedTeachers.find(teacher => teacher.worker.user.id === createCourseDto.teacher);
      if (!foundTeacher) throw new ValidationError([]);
      //Find curriculum
      const curriculum = await CurriculumRepository.getCurriculumById(createCourseDto.curriculum);
      if (curriculum === null) throw new NotFoundError();
      //ChoseSchedule
      const choseSchedule = {
        choseTeacher: foundTeacher,
        choseShifts: [] as Shift[][],
        choseClassroom: [] as Classroom[],
        choseTutor: [] as UserTutor[],
      }
      // Check shifts 
      const availableShiftsofTeacher = await ShiftRepository.findAvailableShiftsOfTeacher(createCourseDto.teacher, createCourseDto.openingDate);
      let currentShiftsPerSession = curriculum.shiftsPerSession;
      createCourseDto.shifts.forEach(shiftArray => {
        if (shiftArray.length !== currentShiftsPerSession) throw new ValidationError([]);
        const shifts: Shift[] = [];
        shiftArray.forEach(shiftId => {
          const foundShift = availableShiftsofTeacher.find(shift => shift.id === shiftId);
          if (!foundShift) throw new ValidationError([]);
          else shifts.push(foundShift);
        });
        choseSchedule.choseShifts.push(shifts);
      })
      // Check classroom
      for (let index = 0; index < createCourseDto.classrooms.length; index++) {
        const classroom = createCourseDto.classrooms[index];
        // Classroom need to be the same branch
        if (classroom.branchId !== createCourseDto.branch)
          throw new ValidationError([]);
        // Check classroom is available or not
        const availableClassrooms = await ClassroomRepository
          .findClassroomAvailable(createCourseDto.branch, createCourseDto.openingDate, createCourseDto.shifts[index]);
        const foundClassroom = availableClassrooms.find(c =>
          c.branch.id === classroom.branchId && c.name.toLowerCase() === classroom.name.toLowerCase());
        if (!foundClassroom)
          throw new ValidationError([]);
        if (foundClassroom.capacity < createCourseDto.maxNumberOfStudent)
          throw new ValidationError([]);
        choseSchedule.choseClassroom.push(foundClassroom);
      }
      // Check tutors
      for (let index = 0; index < createCourseDto.tutors.length; index++) {
        const tutor = createCourseDto.tutors[index];
        // Check tutor is available or not
        const availableTutors = await TutorRepository
          .findTutorsAvailable(createCourseDto.openingDate, createCourseDto.shifts[index]);
        const foundTtutor = availableTutors.find(t => t.worker.user.id === tutor);
        if (!foundTtutor)
          throw new ValidationError([]);
        else choseSchedule.choseTutor.push(foundTtutor);
      }
      // Count course by slug
      let slug = slugify(createCourseDto.name);
      const existedCourseBySlug = await queryRunner.manager
        .createQueryBuilder(Course, "course")
        .where("lower(course.name) = :name", { name: createCourseDto.name })
        .getCount();
      if (existedCourseBySlug > 0) slug = slug + "-" + existedCourseBySlug;
      // Notification
      const teacherNotificationDto = {} as NotificationDto;
      teacherNotificationDto.userId = choseSchedule.choseTeacher.worker.user.id;
      teacherNotificationDto.content = `Khoá học "${createCourseDto.name}" vừa được thêm và chỉ định cho bạn. Vui lòng vào trang web để kiểm tra thông tin.`;
      const teacherNotificationResult = await this.sendNotification(queryRunner, teacherNotificationDto);
      if (teacherNotificationResult.success && teacherNotificationResult.receiverSocketStatuses && teacherNotificationResult.receiverSocketStatuses.length) {
        notifications.push({
          socketIds: teacherNotificationResult.receiverSocketStatuses.map(socketStatus => socketStatus.socketId),
          notification: teacherNotificationResult.notification
        });
      }
      for (const tutor of choseSchedule.choseTutor) {
        const notificationDto = { userId: tutor.worker.user.id } as NotificationDto;
        notificationDto.content = `Khoá học "${createCourseDto.name}" vừa được thêm và chỉ định cho bạn. Vui lòng lên website kiểm tra lại thông tin.`;
        const result = await this.sendNotification(queryRunner, notificationDto);
        if (result.success && result.receiverSocketStatuses && result.receiverSocketStatuses.length) {
          notifications.push({
            socketIds: result.receiverSocketStatuses.map(socketStatus => socketStatus.socketId),
            notification: result.notification
          });
        }
      }
      // Create course;
      let course = new Course();
      course.name = createCourseDto.name;
      course.slug = slug;
      course.maxNumberOfStudent = createCourseDto.maxNumberOfStudent;
      course.price = createCourseDto.price;
      course.openingDate = createCourseDto.openingDate;
      course.closingDate = null;
      course.image = COURSE_DESTINATION_SRC + createCourseDto.image.filename;
      course.curriculum = curriculum;
      course.teacher = foundTeacher;
      course.branch = employee.worker.branch;
      course.lockTime = null;
      course.sessionPerWeek = choseSchedule.choseTutor.length;
      let savedCourse = await queryRunner.manager.save(course);

      // Start creating study session
      const numberOfSessionsPerWeek = createCourseDto.shifts.length;
      const sortedScheduleIndex: number[] = Array(numberOfSessionsPerWeek).fill(0).map((_, index) => index);
      sortedScheduleIndex.sort((prevIndex: number, nextIndex: number) => {
        if (cvtWeekDay2Num(choseSchedule.choseShifts[prevIndex][0].weekDay) >
          cvtWeekDay2Num(choseSchedule.choseShifts[nextIndex][0].weekDay))
          return 1;
        else if (cvtWeekDay2Num(choseSchedule.choseShifts[prevIndex][0].weekDay) <
          cvtWeekDay2Num(choseSchedule.choseShifts[nextIndex][0].weekDay))
          return -1;
        else return 0;
      });

      choseSchedule.choseShifts = sortedScheduleIndex.map(index => choseSchedule.choseShifts[index]);
      choseSchedule.choseClassroom = sortedScheduleIndex.map(index => choseSchedule.choseClassroom[index]);
      choseSchedule.choseTutor = sortedScheduleIndex.map(index => choseSchedule.choseTutor[index]);

      let sheduleIndex = -1;
      let firstDayOfSession = new Date();

      for (let index = 0; index < numberOfSessionsPerWeek; index++) {
        const openingDate = new Date(course.openingDate.getTime());
        const openingDateOffset = openingDate.getDay() == 0 ? 7 : openingDate.getDay()
        const offset = cvtWeekDay2Num(choseSchedule.choseShifts[index][0].weekDay) - 2;
        const date = openingDate.getDate() - openingDateOffset + offset + 1;
        const firstDay = new Date(openingDate.setDate(date));

        if (firstDay >= openingDate) {
          sheduleIndex = index;
          firstDayOfSession = firstDay;
          break;
        }
      }

      if (sheduleIndex === -1) {
        const openingDate = new Date(course.openingDate.getTime());
        const openingDateOffset = openingDate.getDay() == 0 ? 7 : openingDate.getDay()
        const offset = cvtWeekDay2Num(choseSchedule.choseShifts[0][0].weekDay) - 2;
        const date = openingDate.getDate() - openingDateOffset + offset + 8;
        firstDayOfSession = new Date(openingDate.setDate(date));
        sheduleIndex = 0;
      }

      for (let index = 0; index < curriculum.lectures.length; index++) {
        const week = Math.floor(index / numberOfSessionsPerWeek) + 1;
        const dayName = index % numberOfSessionsPerWeek + 1;
        const date = new Date(firstDayOfSession.getTime());

        let studySession = new StudySession();
        studySession.name = `Tuần ${week}, Buổi ${dayName}`;
        studySession.date = date;
        studySession.notes = "";
        studySession.course = course;
        studySession.shifts = choseSchedule.choseShifts[sheduleIndex];
        studySession.tutor = choseSchedule.choseTutor[sheduleIndex];
        studySession.teacher = choseSchedule.choseTeacher;
        studySession.classroom = choseSchedule.choseClassroom[sheduleIndex];
        const validateErrors = await validate(studySession);
        if (validateErrors.length) throw new ValidationError(validateErrors);
        await queryRunner.manager.save(studySession);
        if (index === curriculum.lectures.length - 1) {
          course.expectedClosingDate = new Date(date.getTime());
          break;
        }
        const lastSchedultIndex = sheduleIndex;
        sheduleIndex = (sheduleIndex + 1) % numberOfSessionsPerWeek;
        let offset = cvtWeekDay2Num(choseSchedule.choseShifts[sheduleIndex][0].weekDay) - cvtWeekDay2Num(choseSchedule.choseShifts[lastSchedultIndex][0].weekDay);
        offset = offset <= 0 ? offset + 7 : offset;
        firstDayOfSession = new Date(firstDayOfSession.setDate(firstDayOfSession.getDate() + offset));
      }
      const savedCourseValidateErrors = await validate(savedCourse);
      if (savedCourseValidateErrors.length) throw new ValidationError(savedCourseValidateErrors);
      savedCourse = await queryRunner.manager.save(savedCourse);
      // Commit transaction
      await queryRunner.commitTransaction();
      await queryRunner.release();
      // Send notifications
      notifications.forEach(notification => {
        notification.socketIds.forEach(id => {
          io.to(id).emit("notification", notification.notification);
        });
      });
      return savedCourse;
    } catch (error) {
      console.log(error);
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      return null;
    }
  }


  private getName(oldName: string, newName: string) {
    if (oldName.trim() === newName.trim()) return '"' + oldName.trim() + '"';
    return `"${newName}" (tên cũ: "${oldName}")`;
  }


  async modifyCourse(userId?: number, courseSlug?: string, courseDto?: CreateCourseDto): Promise<Course | null> {
    if (userId === undefined || courseSlug === undefined || courseDto === undefined || courseDto === null)
      return null;
    const notifications: { socketIds: string[], notification: NotificationDto }[] = [];
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect()
    await queryRunner.startTransaction()
    try {
      if (courseDto.curriculum !== undefined) throw new ValidationError([]);
      // Course
      const course = await queryRunner.manager
        .createQueryBuilder(Course, "course")
        .setLock("pessimistic_read")
        .useTransaction(true)
        .leftJoinAndSelect("course.teacher", "teacher")
        .leftJoinAndSelect("teacher.worker", "worker")
        .leftJoinAndSelect("worker.user", "userTeacher")
        .leftJoinAndSelect("course.branch", "branch")
        .leftJoinAndSelect("course.curriculum", "curriculum")
        .where("course.slug = :courseSlug", { courseSlug })
        .getOne();
      if (course === null) throw new NotFoundError();
      course.openingDate = new Date(course.openingDate);
      course.expectedClosingDate = new Date(course.expectedClosingDate);
      const courseName = this.getName(course.name, courseDto.name || "");
      // Course shouldn't be closed
      if (course.closingDate !== null && course.closingDate !== undefined)
        throw new ValidationError([]);
      // Employee
      const employee = await EmployeeRepository.findUserEmployeeByid(userId);
      if (employee === null) throw new NotFoundError();
      // Check branch
      if (employee.worker.branch.id !== course.branch.id)
        throw new ValidationError([]);
      // Version
      if (course.version != courseDto.version)
        throw new InvalidVersionColumnError();
      // Find participations
      const participationCount = await queryRunner.manager
        .createQueryBuilder(StudentParticipateCourse, "p")
        .setLock("pessimistic_read")
        .useTransaction(true)
        .leftJoinAndSelect("p.course", "course")
        .where("course.slug = :courseSlug", { courseSlug })
        .getCount();
      // Course name
      const oldSlug = course.slug;
      if (courseDto.name !== undefined) {
        course.name = courseDto.name;
        let slug = slugify(course.name);
        const existedCourseNameCount = await queryRunner.manager
          .createQueryBuilder(Course, "c")
          .setLock("pessimistic_read")
          .useTransaction(true)
          .where("c.name = :name", { name: course.name })
          .andWhere("c.id <> :id", { id: course.id })
          .getCount();
        if (existedCourseNameCount > 0) slug = slug + "-" + existedCourseNameCount;
        course.slug = slug;
      }
      // Max student counts
      if (courseDto.maxNumberOfStudent !== undefined) {
        if (courseDto.maxNumberOfStudent < participationCount)
          throw new ValidationError([]);
        course.maxNumberOfStudent = courseDto.maxNumberOfStudent;
      }
      // Price
      if (courseDto.price !== undefined) {
        if (participationCount > 0) throw new ValidationError([]);
        course.price = courseDto.price;
      }
      // Image
      let oldImageSrc = undefined;
      if (courseDto.image && courseDto.image.filename) {
        oldImageSrc = course.image;
        course.image = COURSE_DESTINATION_SRC + courseDto.image.filename;
      }
      // ChoseSchedule
      const choseSchedule = {
        choseTeacher: course.teacher,
        choseShifts: [] as Shift[][],
        choseClassroom: [] as Classroom[],
        choseTutor: [] as UserTutor[],
      }
      // Change study session
      let isChangeStudySession = false;
      const oldOpeningDate = new Date(course.openingDate);
      // Change openingDate
      if (courseDto.openingDate !== undefined) {
        // Check new openingDate
        const newOpeningDate = new Date(courseDto.openingDate);
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1)
        tomorrow.setHours(0);
        tomorrow.setMinutes(0);
        tomorrow.setSeconds(0);
        tomorrow.setMilliseconds(0);
        if (newOpeningDate < tomorrow) throw new ValidationError([]);
        // Update
        if ((course.closingDate === null || course.closingDate === undefined) &&
          (new Date() < oldOpeningDate) &&
          courseDto.teacher !== undefined) {
          // Participations
          const participations = await queryRunner.manager
            .createQueryBuilder(StudentParticipateCourse, "p")
            .setLock("pessimistic_read")
            .useTransaction(true)
            .leftJoinAndSelect("p.course", "course")
            .where("course.slug = :courseSlug", { courseSlug })
            .getMany();
          // Change opening date and closing date
          let days = this.diffDays(course.openingDate, courseDto.openingDate);
          if ((new Date(courseDto.openingDate)).getTime() < (new Date(course.openingDate)).getTime())
            days = days * (-1);
          const expectedClosingDate = new Date(course.expectedClosingDate);
          expectedClosingDate.setDate(expectedClosingDate.getDate() + days);
          course.openingDate = new Date(courseDto.openingDate);
          course.expectedClosingDate = expectedClosingDate;
          // Update billingDate
          for (const participation of participations) {
            const billingDate = new Date(participation.billingDate);
            billingDate.setDate(billingDate.getDate() + days);
            participation.billingDate = billingDate;
            await queryRunner.manager.upsert(StudentParticipateCourse, participation, { conflictPaths: [], skipUpdateIfNoValuesChanged: true });
          }
          isChangeStudySession = true;
        } else throw new ValidationError([]);
      }
      // Calculate end date for finding available teacher, tutor, classroom
      const endDate: Date = new Date(course.expectedClosingDate);
      endDate.setDate(endDate.getDate() + 7);
      // Teacher
      if (courseDto.teacher !== undefined) {
        // Check teacher want to teach the course
        const preferedTeachers = await queryRunner.manager
          .createQueryBuilder(UserTeacher, "teacher")
          .setLock("pessimistic_read")
          .useTransaction(true)
          .leftJoinAndSelect("teacher.worker", "worker")
          .leftJoinAndSelect("worker.user", "user")
          .innerJoinAndSelect("teacher.preferredCurriculums", "preferredCurriculums")
          .innerJoinAndSelect("preferredCurriculums.curriculum", "curriculums")
          .where("curriculums.id = :curriculumId", { curriculumId: course.curriculum.id })
          .andWhere("curriculums.latest = true")
          .getMany();
        const foundTeacher = preferedTeachers.find(teacher => teacher.worker.user.id === courseDto.teacher);
        if (!foundTeacher) throw new ValidationError([]);
        // Check number of session per week
        if (courseDto.tutors === undefined ||
          courseDto.classrooms === undefined ||
          courseDto.shifts === undefined ||
          courseDto.tutors.length === 0 ||
          courseDto.classrooms.length === 0 ||
          courseDto.shifts.length === 0 ||
          courseDto.shifts.length !== courseDto.classrooms.length ||
          courseDto.shifts.length !== courseDto.tutors.length ||
          courseDto.classrooms.length !== courseDto.tutors.length ||
          courseDto.tutors.length !== course.sessionPerWeek)
          throw new ValidationError([]);
        // Check shifts 
        const availableShiftsofTeacher = await ShiftRepository.findAvailableShiftsOfTeacher(courseDto.teacher, course.openingDate, endDate, oldSlug);
        let currentShiftsPerSession = course.curriculum.shiftsPerSession;
        courseDto.shifts.forEach(shiftArray => {
          if (shiftArray.length !== currentShiftsPerSession) throw new ValidationError([]);
          const shifts: Shift[] = [];
          shiftArray.forEach(shiftId => {
            const foundShift = availableShiftsofTeacher.find(shift => shift.id === shiftId);
            if (!foundShift) throw new ValidationError([]);
            else shifts.push(foundShift);
          });
          choseSchedule.choseShifts.push(shifts);
        })
        // Check classroom
        for (let index = 0; index < courseDto.classrooms.length; index++) {
          const classroom = courseDto.classrooms[index];
          // Classroom need to be the same branch
          if (classroom.branchId !== course.branch.id)
            throw new ValidationError([]);
          // Check classroom is available or not
          const availableClassrooms = await ClassroomRepository
            .findClassroomAvailable(course.branch.id, course.openingDate, courseDto.shifts[index], endDate, oldSlug);
          const foundClassroom = availableClassrooms.find(c =>
            c.branch.id === classroom.branchId && c.name.toLowerCase() === classroom.name.toLowerCase());
          if (!foundClassroom)
            throw new ValidationError([]);
          if (foundClassroom.capacity < course.maxNumberOfStudent)
            throw new ValidationError([]);
          choseSchedule.choseClassroom.push(foundClassroom);
        }
        // Check tutors
        for (let index = 0; index < courseDto.tutors.length; index++) {
          const tutor = courseDto.tutors[index];
          // Check tutor is available or not
          const availableTutors = await TutorRepository
            .findTutorsAvailable(course.openingDate, courseDto.shifts[index], undefined, endDate, oldSlug);
          const foundTtutor = availableTutors.find(t => t.worker.user.id === tutor);
          if (!foundTtutor)
            throw new ValidationError([]);
          else choseSchedule.choseTutor.push(foundTtutor);
        }
        if (course.teacher.worker.user.id != choseSchedule.choseTeacher.worker.user.id) {
          // Old teacher's notification
          const teacherNotificationDto = {} as NotificationDto;
          teacherNotificationDto.userId = course.teacher.worker.user.id;
          teacherNotificationDto.content = `Khoá học ${courseName} vừa được chỉ định cho giáo viên khác. Vui lòng vào trang web để kiểm tra thông tin.`;
          const teacherNotificationResult = await this.sendNotification(queryRunner, teacherNotificationDto);
          if (teacherNotificationResult.success && teacherNotificationResult.receiverSocketStatuses && teacherNotificationResult.receiverSocketStatuses.length) {
            notifications.push({
              socketIds: teacherNotificationResult.receiverSocketStatuses.map(socketStatus => socketStatus.socketId),
              notification: teacherNotificationResult.notification
            });
          }
          // Assign teacher
          course.teacher = choseSchedule.choseTeacher;
          // New teacher's notification
          const newTeacherNotificationDto = {} as NotificationDto;
          newTeacherNotificationDto.userId = course.teacher.worker.user.id;
          newTeacherNotificationDto.content = `Khoá học ${courseName} vừa được thay đổi và chỉ định cho bạn. Vui lòng vào trang web để kiểm tra thông tin.`;
          const newTeacherNotificationResult = await this.sendNotification(queryRunner, newTeacherNotificationDto);
          if (newTeacherNotificationResult.success && newTeacherNotificationResult.receiverSocketStatuses && newTeacherNotificationResult.receiverSocketStatuses.length) {
            notifications.push({
              socketIds: newTeacherNotificationResult.receiverSocketStatuses.map(socketStatus => socketStatus.socketId),
              notification: newTeacherNotificationResult.notification
            });
          }
        } else {
          const teacherNotificationDto = {} as NotificationDto;
          teacherNotificationDto.userId = course.teacher.worker.user.id;
          teacherNotificationDto.content = `Khoá học ${courseName} vừa được chỉnh sửa. Vui lòng vào trang web để kiểm tra thông tin.`;
          const teacherNotificationResult = await this.sendNotification(queryRunner, teacherNotificationDto);
          if (teacherNotificationResult.success && teacherNotificationResult.receiverSocketStatuses && teacherNotificationResult.receiverSocketStatuses.length) {
            notifications.push({
              socketIds: teacherNotificationResult.receiverSocketStatuses.map(socketStatus => socketStatus.socketId),
              notification: teacherNotificationResult.notification
            });
          }
          // Assign teacher
          course.teacher = choseSchedule.choseTeacher;
        }
        // Tutors' notification
        for (const tutor of choseSchedule.choseTutor) {
          const notificationDto = { userId: tutor.worker.user.id } as NotificationDto;
          notificationDto.content = `Khoá học ${courseName} vừa được chỉnh sửa và chỉ định cho bạn. Vui lòng lên website kiểm tra lại thông tin.`;
          const result = await this.sendNotification(queryRunner, notificationDto);
          if (result.success && result.receiverSocketStatuses && result.receiverSocketStatuses.length) {
            notifications.push({
              socketIds: result.receiverSocketStatuses.map(socketStatus => socketStatus.socketId),
              notification: result.notification
            });
          }
        }
        // Mark change ss
        isChangeStudySession = true;
      } else {
        const teacherNotificationDto = {} as NotificationDto;
        teacherNotificationDto.userId = course.teacher.worker.user.id;
        teacherNotificationDto.content = `Khoá học ${courseName} vừa được chỉnh sửa. Vui lòng vào trang web để kiểm tra thông tin.`;
        const teacherNotificationResult = await this.sendNotification(queryRunner, teacherNotificationDto);
        if (teacherNotificationResult.success && teacherNotificationResult.receiverSocketStatuses && teacherNotificationResult.receiverSocketStatuses.length) {
          notifications.push({
            socketIds: teacherNotificationResult.receiverSocketStatuses.map(socketStatus => socketStatus.socketId),
            notification: teacherNotificationResult.notification
          });
        }
      }
      // Old opening date
      const openingDate = new Date(oldOpeningDate);
      openingDate.setHours(0);
      openingDate.setMinutes(0);
      openingDate.setSeconds(0);
      openingDate.setMilliseconds(0);
      // New opening date
      const newOpeningDate = new Date(course.openingDate);
      newOpeningDate.setHours(0);
      newOpeningDate.setMinutes(0);
      newOpeningDate.setSeconds(0);
      newOpeningDate.setMilliseconds(0);
      // Current date
      const currentDate = new Date();
      currentDate.setHours(0);
      currentDate.setMinutes(0);
      currentDate.setSeconds(0);
      currentDate.setMilliseconds(0);
      // Max date
      const teacherIds = [];
      const tutorIds = [];
      const studentIds: number[] = [];
      const startDate = currentDate < openingDate ? openingDate : currentDate;
      const newStartDate = currentDate < newOpeningDate ? newOpeningDate : currentDate;
      // Study session left 
      const studySessions = await queryRunner.manager
        .createQueryBuilder(StudySession, "ss")
        .setLock("pessimistic_read")
        .useTransaction(true)
        .leftJoinAndSelect("ss.course", "course")
        .leftJoinAndSelect("ss.teacher", "teacher")
        .leftJoinAndSelect("teacher.worker", "teacherWorker")
        .leftJoinAndSelect("teacherWorker.user", "teacherUser")
        .leftJoinAndSelect("ss.tutor", "tutor")
        .leftJoinAndSelect("tutor.worker", "tutorWorker")
        .leftJoinAndSelect("tutorWorker.user", "tutorUser")
        .where("course.slug = :courseSlug", { courseSlug })
        .andWhere("ss.date >= :date", { date: moment(startDate).format("YYYY-MM-DD") })
        .getMany();
      // Update study sessions
      if (isChangeStudySession && studySessions.length > 0) {
        for (const studySession of studySessions) {
          if (teacherIds.find(id => id === studySession.teacher.worker.user.id) === undefined)
            teacherIds.push(studySession.teacher.worker.user.id);
          if (tutorIds.find(id => id === studySession.tutor.worker.user.id) === undefined)
            tutorIds.push(studySession.tutor.worker.user.id);
          const makeups = await queryRunner.manager
            .createQueryBuilder(MakeUpLession, "m")
            .setLock("pessimistic_read")
            .useTransaction(true)
            .leftJoinAndSelect("m.student", "student")
            .leftJoinAndSelect("student.user", "user")
            .where("m.studySessionId = :ssId", { ssId: studySession.id })
            .orWhere("m.targetStudySessionId = :ssId", { ssId: studySession.id })
            .getMany();
          makeups.forEach(makeup => {
            if (studentIds.find(id => id === makeup.student.user.id) === undefined)
              studentIds.push(makeup.student.user.id);
          })
          await queryRunner.manager.remove(studySession);
        }
        for (const tutorId of tutorIds) {
          const notificationDto = { userId: tutorId } as NotificationDto;
          notificationDto.content = `Khoá học "${course.name}" vừa được chỉnh sửa và có thể thay đổi trợ giảng. Vui lòng lên website kiểm tra lại thông tin.`;
          const result = await this.sendNotification(queryRunner, notificationDto);
          if (result.success && result.receiverSocketStatuses && result.receiverSocketStatuses.length) {
            notifications.push({
              socketIds: result.receiverSocketStatuses.map(socketStatus => socketStatus.socketId),
              notification: result.notification
            });
          }
        }
        for (const teacherId of teacherIds) {
          const notificationDto = { userId: teacherId } as NotificationDto;
          notificationDto.content = `Khoá học ${courseName} vừa được chỉnh sửa và có thể thay đổi giáo viên. Vui lòng lên website kiểm tra lại thông tin.`;
          const result = await this.sendNotification(queryRunner, notificationDto);
          if (result.success && result.receiverSocketStatuses && result.receiverSocketStatuses.length) {
            notifications.push({
              socketIds: result.receiverSocketStatuses.map(socketStatus => socketStatus.socketId),
              notification: result.notification
            });
          }
        }
        for (const studentId of studentIds) {
          const notificationDto = { userId: studentId } as NotificationDto;
          notificationDto.content = `Khoá học ${courseName} vừa được chỉnh sửa và do đó, đăng ký học bù của bạn đã bị hủy. Vui lòng lên website kiểm tra lại thông tin.`;
          const result = await this.sendNotification(queryRunner, notificationDto);
          if (result.success && result.receiverSocketStatuses && result.receiverSocketStatuses.length) {
            notifications.push({
              socketIds: result.receiverSocketStatuses.map(socketStatus => socketStatus.socketId),
              notification: result.notification
            });
          }
        }
        // Start creating study session
        const numberOfSessionsPerWeek = course.sessionPerWeek;
        const sortedScheduleIndex: number[] = Array(numberOfSessionsPerWeek).fill(0).map((_, index) => index);
        sortedScheduleIndex.sort((prevIndex: number, nextIndex: number) => {
          if (cvtWeekDay2Num(choseSchedule.choseShifts[prevIndex][0].weekDay) >
            cvtWeekDay2Num(choseSchedule.choseShifts[nextIndex][0].weekDay))
            return 1;
          else if (cvtWeekDay2Num(choseSchedule.choseShifts[prevIndex][0].weekDay) <
            cvtWeekDay2Num(choseSchedule.choseShifts[nextIndex][0].weekDay))
            return -1;
          else return 0;
        });

        choseSchedule.choseShifts = sortedScheduleIndex.map(index => choseSchedule.choseShifts[index]);
        choseSchedule.choseClassroom = sortedScheduleIndex.map(index => choseSchedule.choseClassroom[index]);
        choseSchedule.choseTutor = sortedScheduleIndex.map(index => choseSchedule.choseTutor[index]);

        let sheduleIndex = -1;
        let firstDayOfSession = new Date();

        for (let index = 0; index < numberOfSessionsPerWeek; index++) {
          const openingDate = new Date(newStartDate);
          const openingDateOffset = openingDate.getDay() == 0 ? 7 : openingDate.getDay()
          const offset = cvtWeekDay2Num(choseSchedule.choseShifts[index][0].weekDay) - 2;
          const date = openingDate.getDate() - openingDateOffset + offset + 1;
          const firstDay = new Date(openingDate.setDate(date));

          if (firstDay >= newStartDate) {
            sheduleIndex = index;
            firstDayOfSession = firstDay;
            break;
          }
        }

        if (sheduleIndex === -1) {
          const openingDate = new Date(newStartDate);
          const openingDateOffset = openingDate.getDay() == 0 ? 7 : openingDate.getDay()
          const offset = cvtWeekDay2Num(choseSchedule.choseShifts[0][0].weekDay) - 2;
          const date = openingDate.getDate() - openingDateOffset + offset + 8;
          firstDayOfSession = new Date(openingDate.setDate(date));
          sheduleIndex = 0;
        }

        for (let index = 0; index < studySessions.length; index++) {
          const date = new Date(firstDayOfSession.getTime());
          let studySession = new StudySession();
          studySession.name = studySessions[index].name;
          studySession.date = date;
          studySession.notes = "";
          studySession.course = course;
          studySession.shifts = choseSchedule.choseShifts[sheduleIndex];
          studySession.tutor = choseSchedule.choseTutor[sheduleIndex];
          studySession.teacher = choseSchedule.choseTeacher;
          studySession.classroom = choseSchedule.choseClassroom[sheduleIndex];
          const validateErrors = await validate(studySession);
          if (validateErrors.length) throw new ValidationError(validateErrors);
          await queryRunner.manager.save(studySession);
          if (index === studySessions.length - 1)
            break;
          const lastSchedultIndex = sheduleIndex;
          sheduleIndex = (sheduleIndex + 1) % numberOfSessionsPerWeek;
          let offset = cvtWeekDay2Num(choseSchedule.choseShifts[sheduleIndex][0].weekDay) - cvtWeekDay2Num(choseSchedule.choseShifts[lastSchedultIndex][0].weekDay);
          offset = offset <= 0 ? offset + 7 : offset;
          firstDayOfSession = new Date(firstDayOfSession.setDate(firstDayOfSession.getDate() + offset));
        }
      }
      // Participations
      const participations = await queryRunner.manager
        .createQueryBuilder(StudentParticipateCourse, "p")
        .setLock("pessimistic_read")
        .useTransaction(true)
        .leftJoinAndSelect("p.course", "course")
        .leftJoinAndSelect("p.student", "student")
        .leftJoinAndSelect("student.user", "user")
        .where("course.slug = :courseSlug", { courseSlug })
        .getMany();
      // Notification of students
      for (const participation of participations) {
        const notificationDto = { userId: participation.student.user.id } as NotificationDto;
        notificationDto.content = `Khoá học ${courseName} vừa được chỉnh sửa. Vui lòng lên website kiểm tra lại thông tin.`;
        const result = await this.sendNotification(queryRunner, notificationDto);
        if (result.success && result.receiverSocketStatuses && result.receiverSocketStatuses.length) {
          notifications.push({
            socketIds: result.receiverSocketStatuses.map(socketStatus => socketStatus.socketId),
            notification: result.notification
          });
        }
      }
      // Commit transaction
      const savedCourseValidateErrors = await validate(course);
      if (savedCourseValidateErrors.length) throw new ValidationError(savedCourseValidateErrors);
      const savedCourse = await queryRunner.manager.save(course);
      await queryRunner.commitTransaction();
      await queryRunner.release();
      // Send notifications
      notifications.forEach(notification => {
        notification.socketIds.forEach(id => {
          io.to(id).emit("notification", notification.notification);
        });
      });
      // Remove old image
      if (oldImageSrc && oldImageSrc.length > 0) {
        const filePath = path.join(process.cwd(), "public", oldImageSrc);
        fs.unlinkSync(filePath);
      }
      // Return data
      return savedCourse;
    } catch (error) {
      console.log(error);
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      return null;
    }
  }


  async lockCourse(userId?: number, courseSlug?: string): Promise<Course | null> {
    if (userId === undefined || courseSlug === undefined) return null;
    // Find course
    const course = await CourseRepository.findCourseBySlug(courseSlug);
    if (course === null) throw new NotFoundError();
    // Find employee
    const employee = await EmployeeRepository.findUserEmployeeByid(userId);
    if (employee === null) throw new NotFoundError();
    // Check permission
    if (employee.worker.branch.id !== course.branch.id) return null;
    // Check lock status
    if (course.lockTime !== null && course.lockTime !== undefined) return null;
    course.lockTime = new Date();
    const savedCourse = await course.save();
    return savedCourse;
  }


  async unLockCourse(userId?: number, courseSlug?: string): Promise<Course | null> {
    if (userId === undefined || courseSlug === undefined) return null;
    // Find course
    const course = await CourseRepository.findCourseBySlug(courseSlug);
    if (course === null) throw new NotFoundError();
    // Find employee
    const employee = await EmployeeRepository.findUserEmployeeByid(userId);
    if (employee === null) throw new NotFoundError();
    // Check permission
    if (employee.worker.branch.id !== course.branch.id) return null;
    // Check lock status
    if (course.lockTime === null || course.lockTime === undefined) return null;
    course.lockTime = null;
    const savedCourse = await course.save();
    return savedCourse;
  }


  async repoenCourse(userId?: number, courseSlug?: string): Promise<Course | null> {
    if (userId === undefined || courseSlug === undefined) return null;
    const course = await CourseRepository.findCourseBySlug(courseSlug);
    const employee = await EmployeeRepository.findUserEmployeeByid(userId);
    if (employee === null) throw new NotFoundError();
    if (course === null) return null;
    if (course.closingDate === null) return null;
    if (employee.worker.branch.id !== course.branch.id) return null;
    course.closingDate = null;
    const savedCourse = await course.save();
    return savedCourse;
  }


  async removeCourse(userId?: number, courseSlug?: string): Promise<boolean> {
    if (userId === undefined || courseSlug === undefined) return false;
    const notifications: { socketIds: string[], notification: NotificationDto }[] = [];
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect()
    await queryRunner.startTransaction();
    try {
      // Query course
      const course = await queryRunner.manager
        .createQueryBuilder(Course, "course")
        .setLock("pessimistic_write")
        .useTransaction(true)
        .leftJoinAndSelect("course.teacher", "teacher")
        .leftJoinAndSelect("teacher.worker", "worker")
        .leftJoinAndSelect("worker.user", "userTeacher")
        .leftJoinAndSelect("course.branch", "branch")
        .leftJoinAndSelect("course.curriculum", "curriculum")
        .leftJoinAndSelect("curriculum.lectures", "lectures")
        .where("course.slug = :courseSlug", { courseSlug })
        .getOne();
      if (course === null) throw new NotFoundError();
      // Participations
      const participations = await queryRunner.manager
        .createQueryBuilder(StudentParticipateCourse, "p")
        .leftJoinAndSelect("p.student", "student")
        .leftJoinAndSelect("student.user", "user")
        .leftJoinAndSelect("p.course", "course")
        .where("course.id = :courseId", { courseId: course.id })
        .getMany();
      // Check lock
      if (course.lockTime === null || course.lockTime === undefined)
        throw new ValidationError([]);
      if (participations.length > 0)
        throw new ValidationError([]);
      // Check course belong to branch
      const employee = await queryRunner.manager
        .createQueryBuilder(UserEmployee, "employee")
        .setLock("pessimistic_read")
        .useTransaction(true)
        .leftJoinAndSelect("employee.worker", "worker")
        .leftJoinAndSelect("worker.user", "user")
        .leftJoinAndSelect("worker.branch", "branch")
        .where("user.id = :userId", { userId })
        .getOne();
      if (employee === null) throw new NotFoundError();
      if (employee.worker.branch.id !== course.branch.id) throw new ValidationError([]);
      // Find tutors
      const tutors = await queryRunner.manager
        .createQueryBuilder(UserTutor, "tt")
        .leftJoinAndSelect("tt.worker", "worker")
        .leftJoinAndSelect("worker.user", "user")
        .setLock("pessimistic_read")
        .useTransaction(true)
        .where((qb) => {
          const subQuery = qb
            .subQuery()
            .select("ss.tutorWorker")
            .from(StudySession, "ss")
            .leftJoin("ss.course", "course")
            .where("course.slug = :courseSlug")
            .getQuery()
          return "tt.tutorId IN " + subQuery
        })
        .setParameter("courseSlug", courseSlug)
        .getMany();
      for (const tutor of tutors) {
        const notificationDto = { userId: tutor.worker.user.id } as NotificationDto;
        notificationDto.content = `Khoá học "${course.name}" đã bị hủy. Vui lòng lên website kiểm tra lại thông tin.`;
        const result = await this.sendNotification(queryRunner, notificationDto);
        if (result.success && result.receiverSocketStatuses && result.receiverSocketStatuses.length) {
          notifications.push({
            socketIds: result.receiverSocketStatuses.map(socketStatus => socketStatus.socketId),
            notification: result.notification
          });
        }
      }
      // Teacher
      const teacherNotificationDto = {} as NotificationDto;
      teacherNotificationDto.userId = course.teacher.worker.user.id;
      teacherNotificationDto.content = `Khoá học "${course.name}" đã bị hủy. Vui lòng vào trang web để kiểm tra thông tin.`;
      const teacherNotificationResult = await this.sendNotification(queryRunner, teacherNotificationDto);
      if (teacherNotificationResult.success && teacherNotificationResult.receiverSocketStatuses && teacherNotificationResult.receiverSocketStatuses.length) {
        notifications.push({
          socketIds: teacherNotificationResult.receiverSocketStatuses.map(socketStatus => socketStatus.socketId),
          notification: teacherNotificationResult.notification
        });
      }
      // Makeup
      const makeups = await queryRunner.manager
        .createQueryBuilder(MakeUpLession, "m")
        .leftJoinAndSelect("m.student", "student")
        .leftJoinAndSelect("student.user", "user")
        .leftJoinAndSelect("m.targetStudySession", "targetSs")
        .leftJoinAndSelect("targetSs.course", "targetCourse")
        .where("targetCourse.slug = :targetCourseSlug", { targetCourseSlug: courseSlug })
        .getMany();

      for (const makeup of makeups) {
        const notificationDto = { userId: makeup.student.user.id } as NotificationDto;
        notificationDto.content = `Khoá học "${course.name}" đã bị hủy và do đó, buổi học bù của bạn sẽ bị xóa. Dữ liệu buổi học bù đã thực hiện sẽ được hiển thị trong buổi học chính. Vui lòng lên website kiểm tra lại thông tin.`;
        const result = await this.sendNotification(queryRunner, notificationDto);
        if (result.success && result.receiverSocketStatuses && result.receiverSocketStatuses.length) {
          notifications.push({
            socketIds: result.receiverSocketStatuses.map(socketStatus => socketStatus.socketId),
            notification: result.notification
          });
        }
        await queryRunner.manager.remove(makeup);
      }
      // StudySession
      const studySessions = await queryRunner.manager
        .createQueryBuilder(StudySession, "ss")
        .setLock("pessimistic_write")
        .useTransaction(true)
        .leftJoinAndSelect("ss.course", "course")
        .where("ss.date < :date", { date: moment(course.lockTime).format("YYYY-MM-DD") })
        .andWhere("course.slug = :courseSlug", { courseSlug })
        .getMany();
      for (const studySession of studySessions) {
        // TODO
        // studySession.course = null;
        await queryRunner.manager.save(studySession);
      }

      // StudySession
      const sameDayStudySessions = await queryRunner.manager
        .createQueryBuilder(StudySession, "ss")
        .setLock("pessimistic_write")
        .useTransaction(true)
        .leftJoinAndSelect("ss.course", "course")
        .leftJoinAndSelect("ss.shifts", "shifts")
        .where("ss.date = :date", { date: moment(course.lockTime).format("YYYY-MM-DD") })
        .andWhere("course.slug = :courseSlug", { courseSlug })
        .orderBy({
          "shifts.weekDay": "ASC",
          "shifts.startTime": "ASC",
        })
        .getMany();
      for (const studySession of sameDayStudySessions) {
        const lockTime = new Date(course.lockTime);
        if (lockTime.getHours() >= studySession.shifts[0].startTime.getHours()) {
          // TODO
          // studySession.course = null;
          await queryRunner.manager.save(studySession);
        }
      }
      // Remove image
      if (course.image) {
        const filePath = path.join(process.cwd(), "public", course.image);
        fs.unlinkSync(filePath);
      }
      await queryRunner.manager.remove(course);
      // Curriculum
      const courseCount = await queryRunner.manager
        .createQueryBuilder(Course, "course")
        .setLock("pessimistic_read")
        .useTransaction(true)
        .leftJoinAndSelect("course.curriculum", "curriculum")
        .where("curriculum.id = :curriculumId", { curriculumId: course.curriculum.id })
        .andWhere("course.id <> :courseId", { courseId: course.id })
        .getCount();
      if (courseCount === 0 && course.curriculum.latest === false) {
        if (course.curriculum && course.curriculum.image) {
          const filePath = path.join(process.cwd(), "public", course.curriculum.image);
          fs.unlinkSync(filePath);
        }
        await queryRunner.manager.remove(course.curriculum);
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



  async closeCourse(userId?: number, courseSlug?: string): Promise<Course | null> {
    if (userId === undefined || courseSlug === undefined) return null;
    const course = await CourseRepository.findCourseBySlug(courseSlug);
    const employee = await EmployeeRepository.findUserEmployeeByid(userId);
    if (employee === null) throw new NotFoundError();
    if (course === null) return null;
    if (course.closingDate !== null) return null;
    if (employee.worker.branch.id !== course.branch.id) return null;
    if (moment().diff(moment(course.expectedClosingDate)) < 0) return null;
    course.closingDate = new Date();
    const savedCourse = await course.save();
    return savedCourse;
  }


  async getShifts(date: Date): Promise<Shift[]> {
    const weekDay = getWeekdayFromDate(date);
    if (weekDay === null) throw new ValidationError([]);
    return await ShiftRepository.findShiftsByWeekDay(weekDay);
  }


  async getAvailableTeachersInDate(userId?: number, date?: Date, shiftIds?: number[], studySession?: number, curriculumId?: number, branchId?: number): Promise<UserTeacher[]> {
    if (userId === undefined || shiftIds === undefined || date === undefined ||
      date === null || studySession === undefined || curriculumId === undefined) return [];
    return await UserTeacherRepository.findTeachersAvailableInDate(date, shiftIds, studySession, curriculumId, branchId);
  }


  async getAvailableTutorsInDate(userId?: number, date?: Date, shiftIds?: number[], studySession?: number, branchId?: number): Promise<UserTutor[]> {
    if (userId === undefined || shiftIds === undefined || date === undefined || date === null || studySession === undefined) return [];
    return await TutorRepository.findTutorsAvailableInDate(date, shiftIds, studySession, branchId);
  }


  async getAvailableClassroomInDate(userId?: number, date?: Date, shiftIds?: number[], studySession?: number, branchId?: number): Promise<Classroom[]> {
    if (userId === undefined || shiftIds === undefined || studySession === undefined ||
      date === undefined || date === null || branchId === undefined) return [];
    return await ClassroomRepository.findClassroomAvailableInDate(branchId, date, shiftIds, studySession);
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


  private async calculateAvailableStudentCount(queryRunner: QueryRunner, courseSlug: string, date: Date,
    shiftIds: number[], studySessionId?: number): Promise<{ total: number, free: number, acceptedPercent: number }> {

    const result = { total: 0, free: 0, acceptedPercent: ACCEPTED_PERCENT_STUDENT_ATTENDANCE };
    if (studySessionId !== undefined) {
      const foundStudySession = await queryRunner.manager
        .createQueryBuilder(StudySession, "studySession")
        .setLock("pessimistic_read")
        .useTransaction(true)
        .leftJoinAndSelect("studySession.course", "course")
        .where("studySession.id = :studySessionId", { studySessionId })
        .getOne();
      if (foundStudySession === null) throw new NotFoundError();
      if (foundStudySession.course.slug !== courseSlug) throw new ValidationError([]);
    } else studySessionId = -1;
    // Query total student number of the course
    result.total = await queryRunner.manager
      .createQueryBuilder(StudentParticipateCourse, 'studentPaticipateCourses')
      .setLock("pessimistic_read")
      .useTransaction(true)
      .leftJoinAndSelect("studentPaticipateCourses.course", "course")
      .where("course.slug = :courseSlug", { courseSlug: courseSlug })
      .getCount();
    const busyStudentsQuery = queryRunner.manager
      .createQueryBuilder(UserStudent, "userStudent")
      .setLock("pessimistic_read")
      .useTransaction(true)
      .where((qb) => {
        const subQuery = qb
          .subQuery()
          .select("studentId")
          .from(StudentParticipateCourse, "studentPaticipateCourses")
          .leftJoin("studentPaticipateCourses.course", "course")
          .where("course.slug = :courseSlug")
          .getQuery()
        return "userStudent.studentId IN " + subQuery
      })
      .andWhere((qb) => {
        const subQuery = qb
          .subQuery()
          .select("studentId")
          .from(StudentParticipateCourse, "studentPaticipateCourses")
          .leftJoin("studentPaticipateCourses.course", "course")
          .where((qb) => {
            const subQuery = qb
              .subQuery()
              .select("course.slug")
              .from(StudySession, "studySession")
              .leftJoin("studySession.course", "course")
              .leftJoin("studySession.shifts", "shifts")
              .where("studySession.date = :date")
              .andWhere("studySession.id <> :studySessionId")
              .andWhere(`shifts.id IN (:...ids)`)
              .getQuery();
            return "course.slug IN " + subQuery
          }).getQuery()
        return "userStudent.studentId IN " + subQuery
      })
      .setParameter("courseSlug", courseSlug)
      .setParameter("date", moment(date).format("YYYY-MM-DD"))
      .setParameter("studySessionId", studySessionId)
      .setParameter("ids", shiftIds);
    result.free = result.total - await busyStudentsQuery.getCount();
    return result;
  }


  async getAvaiableStudentCount(userId?: number, studySessionId?: number, courseSlug?: string, date?: Date, shiftIds?: number[]): Promise<{ total: number, free: number, acceptedPercent: number }> {
    if (userId === undefined || courseSlug === undefined ||
      date === undefined || date === null ||
      shiftIds === undefined || shiftIds === null)
      throw new NotFoundError();
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect()
    await queryRunner.startTransaction();
    try {
      const result = await this.calculateAvailableStudentCount(queryRunner, courseSlug, date, shiftIds, studySessionId);
      // Commit transaction
      await queryRunner.commitTransaction();
      await queryRunner.release();
      return result;
    } catch (error) {
      console.log(error);
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      throw error;
    }
  }


  async addStudySession(userId?: number, courseSlug?: string, studySessionDto?: StudySessionDto): Promise<StudySession | null> {
    if (userId === undefined || courseSlug === undefined ||
      studySessionDto === undefined || studySessionDto === null) return null;
    const notifications: { socketIds: string[], notification: NotificationDto }[] = [];

    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect()
    await queryRunner.startTransaction();
    try {
      // Check validations
      if (studySessionDto.name === undefined || studySessionDto.date === undefined ||
        studySessionDto.date === null || studySessionDto.shiftIds === undefined ||
        studySessionDto.shiftIds === null || studySessionDto.teacherId === undefined ||
        studySessionDto.tutorId === undefined || studySessionDto.classroom === undefined ||
        studySessionDto.classroom === null || studySessionDto.classroom.name === undefined ||
        studySessionDto.classroom.branchId === undefined)
        throw new ValidationError([]);
      // Query course
      const course = await queryRunner.manager
        .createQueryBuilder(Course, "course")
        .setLock("pessimistic_read")
        .useTransaction(true)
        .leftJoinAndSelect("course.teacher", "teacher")
        .leftJoinAndSelect("teacher.worker", "worker")
        .leftJoinAndSelect("worker.user", "userTeacher")
        .leftJoinAndSelect("course.branch", "branch")
        .leftJoinAndSelect("course.curriculum", "curriculum")
        .leftJoinAndSelect("curriculum.lectures", "lectures")
        .where("course.slug = :courseSlug", { courseSlug })
        .getOne();
      if (course === null) throw new NotFoundError();
      // Check course belong to branch
      const employee = await queryRunner.manager
        .createQueryBuilder(UserEmployee, "employee")
        .setLock("pessimistic_read")
        .useTransaction(true)
        .leftJoinAndSelect("employee.worker", "worker")
        .leftJoinAndSelect("worker.user", "user")
        .leftJoinAndSelect("worker.branch", "branch")
        .where("user.id = :userId", { userId })
        .getOne();
      if (employee === null) throw new NotFoundError();
      if (employee.worker.branch.id !== course.branch.id) throw new ValidationError([]);
      // Check course isn't closed
      if (course.closingDate !== null) throw new ValidationError([]);
      // Check number of student who can attend new study session
      const result = await this.calculateAvailableStudentCount(queryRunner, course.slug,
        new Date(studySessionDto.date), studySessionDto.shiftIds);
      const percentages = result.total === 0 ? 100 : Math.round(result.free / result.total * 1000) / 10;
      if (percentages < result.acceptedPercent) throw new ValidationError([]);
      // Check date
      const openingDate = new Date(course.openingDate);
      openingDate.setHours(0);
      openingDate.setMinutes(0);
      openingDate.setSeconds(0);
      openingDate.setMilliseconds(0);
      // Current date
      const currentDate = new Date();
      currentDate.setHours(0);
      currentDate.setMinutes(0);
      currentDate.setSeconds(0);
      currentDate.setMilliseconds(0);
      // Max date
      const maxDate = currentDate < openingDate ? openingDate : currentDate;
      if ((new Date(studySessionDto.date)).getTime() < maxDate.getTime())
        throw new ValidationError([]);
      // Add study session
      const studySession = new StudySession();
      studySession.name = studySessionDto.name;
      studySession.date = new Date(studySessionDto.date);
      studySession.course = course;
      // Add time of study session
      const shifts = await queryRunner.manager
        .createQueryBuilder(Shift, "s")
        .setLock("pessimistic_read")
        .useTransaction(true)
        .where(`s.id IN (:...ids)`, { ids: studySessionDto.shiftIds })
        .getMany();
      if (shifts.length !== studySession.course.curriculum.shiftsPerSession)
        throw new ValidationError([]);
      studySession.shifts = shifts;
      // Add teacher
      const teacherNotificationDto = {} as NotificationDto;
      const teacher = await queryRunner.manager
        .createQueryBuilder(UserTeacher, "tt")
        .setLock("pessimistic_read")
        .useTransaction(true)
        .leftJoinAndSelect("tt.worker", "worker")
        .leftJoinAndSelect("worker.user", "user")
        .where("user.id = :teacherId", { teacherId: studySessionDto.teacherId })
        .getOne();
      if (teacher === null) throw new NotFoundError();
      // Check teacher want to teach this study session and is available
      const busyTeacherIdsQuery = queryRunner.manager
        .createQueryBuilder(StudySession, "ss")
        .setLock("pessimistic_read")
        .useTransaction(true)
        .leftJoinAndSelect("ss.shifts", "shifts")
        .leftJoinAndSelect("ss.teacher", "teacher")
        .leftJoinAndSelect("teacher.worker", "worker")
        .leftJoinAndSelect("worker.user", "userTeacher")
        .select("userTeacher.id", "id")
        .distinct(true)
        .where("ss.date = :date", { date: moment(studySessionDto.date).format("YYYY-MM-DD") })
        .andWhere(`shifts.id IN (:...ids)`, { ids: studySessionDto.shiftIds });
      const teacherQuery = queryRunner.manager
        .createQueryBuilder(UserTeacher, "tt")
        .setLock("pessimistic_read")
        .useTransaction(true)
        .leftJoinAndSelect("tt.worker", "worker")
        .leftJoinAndSelect("worker.user", "userTeacher")
        .leftJoinAndSelect("tt.preferredCurriculums", "preferredCurriculums")
        .leftJoinAndSelect("preferredCurriculums.curriculum", "curriculums")
        .where(`userTeacher.id NOT IN (${busyTeacherIdsQuery.getQuery()})`)
        .andWhere("curriculums.id = :curriculumId", { curriculumId: studySession.course.curriculum.id })
        .setParameters(busyTeacherIdsQuery.getParameters());
      const teachers = await teacherQuery.getMany();
      const foundTeacher = teachers.find(t => t.worker.user.id === teacher.worker.user.id);
      if (foundTeacher === undefined) throw new NotFoundError();
      // Update teacher
      studySession.teacher = teacher;
      // Teacher notification
      teacherNotificationDto.userId = studySession.teacher.worker.user.id;
      teacherNotificationDto.content = `Buổi học "${studySession.name}", khoá học "${studySession.course.name}" mới được bổ sung. Vui lòng vào trang web để kiểm tra thông tin.`;
      const teacherNotificationResult = await this.sendNotification(queryRunner, teacherNotificationDto);
      if (teacherNotificationResult.success && teacherNotificationResult.receiverSocketStatuses && teacherNotificationResult.receiverSocketStatuses.length) {
        notifications.push({
          socketIds: teacherNotificationResult.receiverSocketStatuses.map(socketStatus => socketStatus.socketId),
          notification: teacherNotificationResult.notification
        });
      }
      // Tutor
      const tutorNotificationDto = {} as NotificationDto;
      const tutor = await queryRunner.manager
        .createQueryBuilder(UserTutor, "tt")
        .setLock("pessimistic_read")
        .useTransaction(true)
        .leftJoinAndSelect("tt.worker", "worker")
        .leftJoinAndSelect("worker.user", "user")
        .where("user.id = :tutorId", { tutorId: studySessionDto.tutorId })
        .getOne();
      if (tutor === null) throw new NotFoundError();
      // Check tutor is available
      const busyTutorIdsQuery = queryRunner.manager
        .createQueryBuilder(StudySession, "ss")
        .setLock("pessimistic_read")
        .useTransaction(true)
        .leftJoinAndSelect("ss.shifts", "shifts")
        .leftJoinAndSelect("ss.tutor", "tutor")
        .leftJoinAndSelect("tutor.worker", "worker")
        .leftJoinAndSelect("worker.user", "userTutor")
        .select("userTutor.id", "id")
        .distinct(true)
        .where("ss.date = :date", { date: moment(studySessionDto.date).format("YYYY-MM-DD") })
        .andWhere("ss.id <> :studySessionId", { studySessionId: studySession.id })
        .andWhere(`shifts.id IN (:...ids)`, { ids: studySessionDto.shiftIds });
      const freeTutorsIdQuery = queryRunner.manager
        .createQueryBuilder(UserTutor, "tt")
        .setLock("pessimistic_read")
        .useTransaction(true)
        .innerJoinAndSelect("tt.shifts", "freeShifts")
        .select("tt.tutorId", "id")
        .distinct(true)
        .where(`freeShifts.id IN (:...ids)`, { ids: studySessionDto.shiftIds })
        .groupBy("tt.tutorId")
        .having("count(tt.tutorId) = :numberOfShifts", { numberOfShifts: studySessionDto.shiftIds.length })
      const tutorQuery = queryRunner.manager
        .createQueryBuilder(UserTutor, "tt")
        .setLock("pessimistic_read")
        .useTransaction(true)
        .leftJoinAndSelect("tt.worker", "worker")
        .leftJoinAndSelect("worker.user", "userTutor")
        .where(`userTutor.id NOT IN (${busyTutorIdsQuery.getQuery()})`)
        .andWhere(`userTutor.id IN (${freeTutorsIdQuery.getQuery()})`)
        .setParameters({ ...busyTutorIdsQuery.getParameters(), ...freeTutorsIdQuery.getParameters() });
      const tutors = await tutorQuery.getMany();
      const foundTutor = tutors.find(t => t.worker.user.id === tutor.worker.user.id);
      if (foundTutor === undefined) throw new NotFoundError();
      //Update tutors
      studySession.tutor = tutor;
      // New tutor notification
      tutorNotificationDto.userId = studySession.tutor.worker.user.id;
      tutorNotificationDto.content = `Buổi học "${studySession.name}", khoá học "${studySession.course.name}" mới được bổ sung. Vui lòng vào trang web để kiểm tra thông tin.`;
      const tutorNotificationResult = await this.sendNotification(queryRunner, tutorNotificationDto);
      if (tutorNotificationResult.success && tutorNotificationResult.receiverSocketStatuses && tutorNotificationResult.receiverSocketStatuses.length) {
        notifications.push({
          socketIds: tutorNotificationResult.receiverSocketStatuses.map(socketStatus => socketStatus.socketId),
          notification: tutorNotificationResult.notification
        });
      }
      // Classroom
      const classroom = await queryRunner.manager
        .createQueryBuilder(Classroom, "cr")
        .setLock("pessimistic_read")
        .leftJoinAndSelect("cr.branch", "branch")
        .useTransaction(true)
        .where("cr.name = :name", { name: studySessionDto.classroom.name })
        .andWhere("branch.id = :branchId", { branchId: studySessionDto.classroom.branchId })
        .getOne();
      if (classroom === null) throw new NotFoundError();
      if (classroom.branch.id !== studySession.course.branch.id) throw new ValidationError([]);
      // Check classroom is available
      const busyClassroomIdsOfClassroomQuery = queryRunner.manager
        .createQueryBuilder(StudySession, "ss")
        .setLock("pessimistic_read")
        .useTransaction(true)
        .leftJoinAndSelect("ss.shifts", "shifts")
        .leftJoinAndSelect("ss.classroom", "classroom")
        .leftJoinAndSelect("classroom.branch", "branch")
        .select("classroom.name", "name")
        .addSelect("branch.id", "branchId")
        .distinct(true)
        .where("ss.date = :date", { date: moment(studySessionDto.date).format("YYYY-MM-DD") })
        .andWhere("ss.id <> :studySessionId", { studySessionId: studySession.id })
        .andWhere(`shifts.id IN (:...ids)`, { ids: studySessionDto.shiftIds });
      const classroomQuery = queryRunner.manager
        .createQueryBuilder(Classroom, "cr")
        .setLock("pessimistic_read")
        .useTransaction(true)
        .leftJoinAndSelect("cr.branch", "branch")
        .where("branch.id = :branchId", { branchId: studySession.course.branch.id })
        .andWhere(`(cr.name, branch.id) NOT IN (${busyClassroomIdsOfClassroomQuery.getQuery()})`)
        .andWhere(`cr.function = '${ClassroomFunction.CLASSROOM}'`)
        .setParameters(busyClassroomIdsOfClassroomQuery.getParameters());
      const classrooms = await classroomQuery.getMany();
      const foundClassroom = classrooms.find(c => c.name === classroom.name && c.branch.id === classroom.branch.id);
      if (foundClassroom === undefined) throw new NotFoundError();
      if (foundClassroom.capacity < course.maxNumberOfStudent)
        throw new ValidationError([]);
      //Update classroom
      studySession.classroom = classroom;
      // Participations
      const participations = await queryRunner.manager
        .createQueryBuilder(StudentParticipateCourse, "p")
        .leftJoinAndSelect("p.student", "student")
        .leftJoinAndSelect("student.user", "user")
        .leftJoinAndSelect("p.course", "course")
        .where("course.id = :courseId", { courseId: studySession.course.id })
        .getMany();
      for (const participation of participations) {
        const notificationDto = { userId: participation.student.user.id } as NotificationDto;
        notificationDto.content = `Buổi học "${studySession.name}", khoá học "${studySession.course.name}" mới được bổ sung. Vui lòng lên website kiểm tra lại thông tin.`;
        const result = await this.sendNotification(queryRunner, notificationDto);
        if (result.success && result.receiverSocketStatuses && result.receiverSocketStatuses.length) {
          notifications.push({
            socketIds: result.receiverSocketStatuses.map(socketStatus => socketStatus.socketId),
            notification: result.notification
          });
        }
      }
      // Validate entity
      const validateErrors = await validate(studySession);
      if (validateErrors.length) throw new ValidationError(validateErrors);
      // Commit transaction
      await queryRunner.manager.save(studySession);
      await queryRunner.commitTransaction();
      await queryRunner.release();
      await studySession.reload();
      // Send notifications
      notifications.forEach(notification => {
        notification.socketIds.forEach(id => {
          io.to(id).emit("notification", notification.notification);
        });
      });
      return studySession;
    } catch (error) {
      console.log(error);
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      return null;
    }
  }


  async updateStudySession(userId?: number, studySessionDto?: StudySessionDto): Promise<StudySession | null> {
    if (userId === undefined || studySessionDto === undefined || studySessionDto === null) return null;
    const notifications: { socketIds: string[], notification: NotificationDto }[] = [];

    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect()
    await queryRunner.startTransaction();
    try {
      // Check validations
      if (studySessionDto.name === undefined || studySessionDto.date === undefined ||
        studySessionDto.date === null || studySessionDto.shiftIds === undefined ||
        studySessionDto.shiftIds === null || studySessionDto.teacherId === undefined ||
        studySessionDto.tutorId === undefined || studySessionDto.classroom === undefined ||
        studySessionDto.classroom === null || studySessionDto.classroom.name === undefined ||
        studySessionDto.classroom.branchId === undefined || studySessionDto.version === undefined ||
        studySessionDto.id === undefined)
        throw new ValidationError([]);

      const studySession = await queryRunner.manager
        .createQueryBuilder(StudySession, "ss")
        .setLock("pessimistic_write")
        .useTransaction(true)
        .leftJoinAndSelect("ss.course", "course")
        .leftJoinAndSelect("ss.teacher", "ssTeacher")
        .leftJoinAndSelect("ssTeacher.worker", "ssWorker")
        .leftJoinAndSelect("ssWorker.user", "ssUserTeacher")
        .leftJoinAndSelect("ss.tutor", "ssTutor")
        .leftJoinAndSelect("ssTutor.worker", "workerTutor")
        .leftJoinAndSelect("workerTutor.user", "userTutor")
        .leftJoinAndSelect("course.teacher", "teacher")
        .leftJoinAndSelect("teacher.worker", "worker")
        .leftJoinAndSelect("worker.user", "userTeacher")
        .leftJoinAndSelect("course.branch", "branch")
        .leftJoinAndSelect("course.curriculum", "curriculum")
        .leftJoinAndSelect("curriculum.lectures", "lectures")
        .leftJoinAndSelect("ss.shifts", "shifts")
        .leftJoinAndSelect("ss.classroom", "classroom")
        .leftJoinAndSelect("classroom.branch", "branchClassroom")
        .where("ss.id = :studySessionId", { studySessionId: studySessionDto.id })
        .getOne();
      if (studySession === null) throw new NotFoundError();
      const studySessionName = this.getName(studySession.name, studySessionDto.name);
      // Check course belong to branch
      const employee = await queryRunner.manager
        .createQueryBuilder(UserEmployee, "employee")
        .setLock("pessimistic_read")
        .useTransaction(true)
        .leftJoinAndSelect("employee.worker", "worker")
        .leftJoinAndSelect("worker.user", "user")
        .leftJoinAndSelect("worker.branch", "branch")
        .where("user.id = :userId", { userId })
        .getOne();
      if (employee === null) throw new NotFoundError();
      if (employee.worker.branch.id !== studySession.course.branch.id) throw new ValidationError([]);
      // Check course isn't closed
      if (studySession.course.closingDate !== null) throw new ValidationError([]);
      // Check version
      if (studySession.version !== studySessionDto.version)
        throw new InvalidVersionColumnError();
      // Check date
      const openingDate = new Date(studySession.course.openingDate);
      openingDate.setHours(0);
      openingDate.setMinutes(0);
      openingDate.setSeconds(0);
      openingDate.setMilliseconds(0);
      // Current date
      const currentDate = new Date();
      currentDate.setHours(0);
      currentDate.setMinutes(0);
      currentDate.setSeconds(0);
      currentDate.setMilliseconds(0);
      // Max date
      const maxDate = currentDate < openingDate ? openingDate : currentDate;
      if ((new Date(studySessionDto.date)).getTime() < maxDate.getTime())
        throw new ValidationError([]);
      if ((new Date(studySession.date)).getTime() < maxDate.getTime())
        throw new ValidationError([]);
      // Check change shifts and date
      let sameTime = true;
      const oldDate = new Date(studySession.date);
      const updatedDate = new Date(studySessionDto.date);
      if (updatedDate.getDate() !== oldDate.getDate() ||
        updatedDate.getMonth() !== oldDate.getMonth() ||
        updatedDate.getFullYear() !== oldDate.getFullYear())
        sameTime = false;
      const oldShiftsId = studySession.shifts.map(s => s.id).sort();
      studySessionDto.shiftIds.sort();
      const equalShifts = oldShiftsId.length === studySessionDto.shiftIds.length
        && oldShiftsId.every(function (value, index) { return value === studySessionDto.shiftIds[index] })
      if (!equalShifts) sameTime = false;
      // Check same classroom
      const sameClassroom =
        studySession.classroom?.name.toLowerCase() === studySessionDto.classroom.name.toLowerCase() &&
        studySession.classroom?.branch.id === studySessionDto.classroom.branchId;
      // Check number of student who can attend new study session
      const result = await this.calculateAvailableStudentCount(queryRunner, studySession.course.slug,
        updatedDate, studySessionDto.shiftIds, studySessionDto.id);
      const percentages = result.total === 0 ? 100 : Math.round(result.free / result.total * 1000) / 10;
      if (percentages < result.acceptedPercent) throw new ValidationError([]);
      // Update study session
      studySession.name = studySessionDto.name;
      studySession.date = updatedDate;
      // Update time of study session
      const shifts = await queryRunner.manager
        .createQueryBuilder(Shift, "s")
        .setLock("pessimistic_read")
        .useTransaction(true)
        .where(`s.id IN (:...ids)`, { ids: studySessionDto.shiftIds })
        .getMany();
      if (shifts.length !== studySession.course.curriculum.shiftsPerSession)
        throw new ValidationError([]);
      studySession.shifts = shifts;
      // Update teacher
      if (studySession.teacher.worker.user.id == studySessionDto.teacherId) {
        if (!sameTime || !sameClassroom) {
          const notificationDto = { userId: studySessionDto.teacherId } as NotificationDto;
          notificationDto.content = `Buổi học ${studySessionName}, khoá học "${studySession.course.name}" có sự cập nhật. Vui lòng vào trang web để kiểm tra lại thông tin.`;
          const result = await this.sendNotification(queryRunner, notificationDto);
          if (result.success && result.receiverSocketStatuses && result.receiverSocketStatuses.length) {
            notifications.push({
              socketIds: result.receiverSocketStatuses.map(socketStatus => socketStatus.socketId),
              notification: result.notification
            });
          }
        }
      } else {
        // Old teacher notification
        const notificationDto = { userId: studySession.teacher.worker.user.id } as NotificationDto;
        notificationDto.content = `Buổi học ${studySessionName}, khoá học "${studySession.course.name}" đã được chuyển cho giáo viên khác. Vui lòng vào trang web để kiểm tra lại thông tin.`;
        let result = await this.sendNotification(queryRunner, notificationDto);
        if (result.success && result.receiverSocketStatuses && result.receiverSocketStatuses.length) {
          notifications.push({
            socketIds: result.receiverSocketStatuses.map(socketStatus => socketStatus.socketId),
            notification: result.notification
          });
        }
        const teacher = await queryRunner.manager
          .createQueryBuilder(UserTeacher, "tt")
          .setLock("pessimistic_read")
          .useTransaction(true)
          .leftJoinAndSelect("tt.worker", "worker")
          .leftJoinAndSelect("worker.user", "user")
          .where("user.id = :teacherId", { teacherId: studySessionDto.teacherId })
          .getOne();
        if (teacher === null) throw new NotFoundError();
        // Check teacher want to teach this study session and is available
        const busyTeacherIdsQuery = queryRunner.manager
          .createQueryBuilder(StudySession, "ss")
          .setLock("pessimistic_read")
          .useTransaction(true)
          .leftJoinAndSelect("ss.shifts", "shifts")
          .leftJoinAndSelect("ss.teacher", "teacher")
          .leftJoinAndSelect("teacher.worker", "worker")
          .leftJoinAndSelect("worker.user", "userTeacher")
          .select("userTeacher.id", "id")
          .distinct(true)
          .where("ss.date = :date", { date: moment(studySessionDto.date).format("YYYY-MM-DD") })
          .andWhere("ss.id <> :studySessionId", { studySessionId: studySession.id })
          .andWhere(`shifts.id IN (:...ids)`, { ids: studySessionDto.shiftIds });
        const teacherQuery = queryRunner.manager
          .createQueryBuilder(UserTeacher, "tt")
          .setLock("pessimistic_read")
          .useTransaction(true)
          .leftJoinAndSelect("tt.worker", "worker")
          .leftJoinAndSelect("worker.user", "userTeacher")
          .leftJoinAndSelect("tt.preferredCurriculums", "preferredCurriculums")
          .leftJoinAndSelect("preferredCurriculums.curriculum", "curriculums")
          .where(`userTeacher.id NOT IN (${busyTeacherIdsQuery.getQuery()})`)
          .andWhere("curriculums.id = :curriculumId", { curriculumId: studySession.course.curriculum.id })
          .setParameters(busyTeacherIdsQuery.getParameters());
        const teachers = await teacherQuery.getMany();
        const foundTeacher = teachers.find(t => t.worker.user.id === teacher.worker.user.id);
        if (foundTeacher === undefined) throw new NotFoundError();
        // Update teacher
        studySession.teacher = teacher;
        // New teacher notification
        notificationDto.userId = studySession.teacher.worker.user.id;
        notificationDto.content = `Buổi học ${studySessionName}, khoá học "${studySession.course.name}" đã được chuyển cho bạn để dạy thay, giáo viên cũ không thể dạy buổi học này. Vui lòng vào trang web để kiểm tra thông tin.`;
        result = await this.sendNotification(queryRunner, notificationDto);
        if (result.success && result.receiverSocketStatuses && result.receiverSocketStatuses.length) {
          notifications.push({
            socketIds: result.receiverSocketStatuses.map(socketStatus => socketStatus.socketId),
            notification: result.notification
          });
        }
      }
      // Update tutor
      if (studySession.tutor.worker.user.id == studySessionDto.tutorId) {
        if (!sameTime || !sameClassroom) {
          const notificationDto = { userId: studySessionDto.tutorId } as NotificationDto;
          notificationDto.content = `Buổi học ${studySessionName}, khoá học "${studySession.course.name}" có sự cập nhật. Vui lòng vào trang web để kiểm tra lại thông tin.`;
          const result = await this.sendNotification(queryRunner, notificationDto);
          if (result.success && result.receiverSocketStatuses && result.receiverSocketStatuses.length) {
            notifications.push({
              socketIds: result.receiverSocketStatuses.map(socketStatus => socketStatus.socketId),
              notification: result.notification
            });
          }
        }
      } else {
        // Old tutor notification
        const notificationDto = { userId: studySession.tutor.worker.user.id } as NotificationDto;
        notificationDto.content = `Buổi học ${studySessionName}, khoá học "${studySession.course.name}" đã được chuyển cho trợ giảng khác. Vui lòng vào trang web để kiểm tra lại thông tin.`;
        let result = await this.sendNotification(queryRunner, notificationDto);
        if (result.success && result.receiverSocketStatuses && result.receiverSocketStatuses.length) {
          notifications.push({
            socketIds: result.receiverSocketStatuses.map(socketStatus => socketStatus.socketId),
            notification: result.notification
          });
        }

        const tutor = await queryRunner.manager
          .createQueryBuilder(UserTutor, "tt")
          .setLock("pessimistic_read")
          .useTransaction(true)
          .leftJoinAndSelect("tt.worker", "worker")
          .leftJoinAndSelect("worker.user", "user")
          .where("user.id = :tutorId", { tutorId: studySessionDto.tutorId })
          .getOne();
        if (tutor === null) throw new NotFoundError();
        // Check tutor is available
        const busyTutorIdsQuery = queryRunner.manager
          .createQueryBuilder(StudySession, "ss")
          .setLock("pessimistic_read")
          .useTransaction(true)
          .leftJoinAndSelect("ss.shifts", "shifts")
          .leftJoinAndSelect("ss.tutor", "tutor")
          .leftJoinAndSelect("tutor.worker", "worker")
          .leftJoinAndSelect("worker.user", "userTutor")
          .select("userTutor.id", "id")
          .distinct(true)
          .where("ss.date = :date", { date: moment(studySessionDto.date).format("YYYY-MM-DD") })
          .andWhere("ss.id <> :studySessionId", { studySessionId: studySession.id })
          .andWhere(`shifts.id IN (:...ids)`, { ids: studySessionDto.shiftIds });
        const freeTutorsIdQuery = queryRunner.manager
          .createQueryBuilder(UserTutor, "tt")
          .setLock("pessimistic_read")
          .useTransaction(true)
          .innerJoinAndSelect("tt.shifts", "freeShifts")
          .select("tt.tutorId", "id")
          .distinct(true)
          .where(`freeShifts.id IN (:...ids)`, { ids: studySessionDto.shiftIds })
          .groupBy("tt.tutorId")
          .having("count(tt.tutorId) = :numberOfShifts", { numberOfShifts: studySessionDto.shiftIds.length })
        const tutorQuery = queryRunner.manager
          .createQueryBuilder(UserTutor, "tt")
          .setLock("pessimistic_read")
          .useTransaction(true)
          .leftJoinAndSelect("tt.worker", "worker")
          .leftJoinAndSelect("worker.user", "userTutor")
          .where(`userTutor.id NOT IN (${busyTutorIdsQuery.getQuery()})`)
          .andWhere(`userTutor.id IN (${freeTutorsIdQuery.getQuery()})`)
          .setParameters({ ...busyTutorIdsQuery.getParameters(), ...freeTutorsIdQuery.getParameters() });
        const tutors = await tutorQuery.getMany();
        const foundTutor = tutors.find(t => t.worker.user.id === tutor.worker.user.id);
        if (foundTutor === undefined) throw new NotFoundError();
        //Update tutors
        studySession.tutor = tutor;
        // New tutor notification
        notificationDto.userId = studySession.tutor.worker.user.id;
        notificationDto.content = `Buổi học ${studySessionName}, khoá học "${studySession.course.name}" đã được chuyển cho bạn để dạy thay,trợ giảng cũ không thể dạy buổi học này. Vui lòng vào trang web để kiểm tra thông tin.`;
        result = await this.sendNotification(queryRunner, notificationDto);
        if (result.success && result.receiverSocketStatuses && result.receiverSocketStatuses.length) {
          notifications.push({
            socketIds: result.receiverSocketStatuses.map(socketStatus => socketStatus.socketId),
            notification: result.notification
          });
        }
      }

      const classroom = await queryRunner.manager
        .createQueryBuilder(Classroom, "cr")
        .setLock("pessimistic_read")
        .leftJoinAndSelect("cr.branch", "branch")
        .useTransaction(true)
        .where("cr.name = :name", { name: studySessionDto.classroom.name })
        .andWhere("branch.id = :branchId", { branchId: studySessionDto.classroom.branchId })
        .getOne();
      if (classroom === null) throw new NotFoundError();
      if (classroom.branch.id !== studySession.course.branch.id) throw new ValidationError([]);
      // Check classroom is available
      const busyClassroomIdsOfClassroomQuery = queryRunner.manager
        .createQueryBuilder(StudySession, "ss")
        .setLock("pessimistic_read")
        .useTransaction(true)
        .leftJoinAndSelect("ss.shifts", "shifts")
        .leftJoinAndSelect("ss.classroom", "classroom")
        .leftJoinAndSelect("classroom.branch", "branch")
        .select("classroom.name", "name")
        .addSelect("branch.id", "branchId")
        .distinct(true)
        .where("ss.date = :date", { date: moment(studySessionDto.date).format("YYYY-MM-DD") })
        .andWhere("ss.id <> :studySessionId", { studySessionId: studySession.id })
        .andWhere(`shifts.id IN (:...ids)`, { ids: studySessionDto.shiftIds });
      const classroomQuery = queryRunner.manager
        .createQueryBuilder(Classroom, "cr")
        .setLock("pessimistic_read")
        .useTransaction(true)
        .leftJoinAndSelect("cr.branch", "branch")
        .where("branch.id = :branchId", { branchId: studySession.course.branch.id })
        .andWhere(`(cr.name, branch.id) NOT IN (${busyClassroomIdsOfClassroomQuery.getQuery()})`)
        .andWhere(`cr.function = '${ClassroomFunction.CLASSROOM}'`)
        .setParameters(busyClassroomIdsOfClassroomQuery.getParameters());
      const classrooms = await classroomQuery.getMany();
      const foundClassroom = classrooms.find(c => c.name === classroom.name && c.branch.id === classroom.branch.id);
      if (foundClassroom === undefined) throw new NotFoundError();
      if (foundClassroom.capacity < studySession.course.maxNumberOfStudent)
        throw new ValidationError([]);
      //Update classroom
      studySession.classroom = classroom;
      // Delete makeup lession
      const makeupLessons = await queryRunner.manager.createQueryBuilder(MakeUpLession, "mul")
        .leftJoinAndSelect("mul.student", "student")
        .leftJoinAndSelect("student.user", "user")
        .where("mul.targetStudySessionId = :targetStudySessionId", { targetStudySessionId: studySession.id })
        .getMany();
      for (const makeupLesson of makeupLessons) {
        const notificationDto = { userId: makeupLesson.student.user.id } as NotificationDto;
        if (!sameTime) {
          await queryRunner.manager.remove(makeupLesson);
          notificationDto.content = `Buổi học bù ${studySessionName}, khoá học "${studySession.course.name}" đã bị hủy, vui lòng lên website và đăng ký lại buổi học khác.`;
          const result = await this.sendNotification(queryRunner, notificationDto);
          if (result.success && result.receiverSocketStatuses && result.receiverSocketStatuses.length) {
            notifications.push({
              socketIds: result.receiverSocketStatuses.map(socketStatus => socketStatus.socketId),
              notification: result.notification
            });
          }
        } else if (!sameClassroom) {
          notificationDto.content = `Buổi học bù ${studySessionName}, khoá học "${studySession.course.name}" có sự cập nhật. Vui lòng lên website kiểm tra lại thông tin.`;
          const result = await this.sendNotification(queryRunner, notificationDto);
          if (result.success && result.receiverSocketStatuses && result.receiverSocketStatuses.length) {
            notifications.push({
              socketIds: result.receiverSocketStatuses.map(socketStatus => socketStatus.socketId),
              notification: result.notification
            });
          }
        }
      }
      const participations = await queryRunner.manager
        .createQueryBuilder(StudentParticipateCourse, "p")
        .leftJoinAndSelect("p.student", "student")
        .leftJoinAndSelect("student.user", "user")
        .leftJoinAndSelect("p.course", "course")
        .where("course.id = :courseId", { courseId: studySession.course.id })
        .getMany();
      for (const participation of participations) {
        if (!sameTime || !sameClassroom) {
          const notificationDto = { userId: participation.student.user.id } as NotificationDto;
          notificationDto.content = `Buổi học ${studySessionName}, khoá học "${studySession.course.name}" có sự cập nhật. Vui lòng lên website kiểm tra lại thông tin.`;
          const result = await this.sendNotification(queryRunner, notificationDto);
          if (result.success && result.receiverSocketStatuses && result.receiverSocketStatuses.length) {
            notifications.push({
              socketIds: result.receiverSocketStatuses.map(socketStatus => socketStatus.socketId),
              notification: result.notification
            });
          }
        }
      }
      // Validate entity
      const validateErrors = await validate(studySession);
      if (validateErrors.length) throw new ValidationError(validateErrors);
      // Commit transaction
      await queryRunner.manager.save(studySession);
      await queryRunner.commitTransaction();
      await queryRunner.release();
      await studySession.reload();
      // Send notifications
      notifications.forEach(notification => {
        notification.socketIds.forEach(id => {
          io.to(id).emit("notification", notification.notification);
        });
      });
      return studySession;
    } catch (error) {
      console.log(error);
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      return null;
    }
  }


  async removeStudySession(userId?: number, studySessionId?: number): Promise<boolean> {
    if (userId === undefined || studySessionId === undefined) return false;
    const notifications: { socketIds: string[], notification: NotificationDto }[] = [];

    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect()
    await queryRunner.startTransaction();
    try {
      const studySession = await queryRunner.manager
        .createQueryBuilder(StudySession, "ss")
        .setLock("pessimistic_write")
        .useTransaction(true)
        .leftJoinAndSelect("ss.course", "course")
        .leftJoinAndSelect("ss.teacher", "ssTeacher")
        .leftJoinAndSelect("ssTeacher.worker", "ssWorker")
        .leftJoinAndSelect("ssWorker.user", "ssUserTeacher")
        .leftJoinAndSelect("ss.tutor", "ssTutor")
        .leftJoinAndSelect("ssTutor.worker", "workerTutor")
        .leftJoinAndSelect("workerTutor.user", "userTutor")
        .leftJoinAndSelect("course.teacher", "teacher")
        .leftJoinAndSelect("teacher.worker", "worker")
        .leftJoinAndSelect("worker.user", "userTeacher")
        .leftJoinAndSelect("course.branch", "branch")
        .leftJoinAndSelect("course.curriculum", "curriculum")
        .leftJoinAndSelect("curriculum.lectures", "lectures")
        .leftJoinAndSelect("ss.shifts", "shifts")
        .where("ss.id = :studySessionId", { studySessionId })
        .getOne();
      if (studySession === null) throw new NotFoundError();
      // Check course belong to branch
      const employee = await queryRunner.manager
        .createQueryBuilder(UserEmployee, "employee")
        .setLock("pessimistic_read")
        .useTransaction(true)
        .leftJoinAndSelect("employee.worker", "worker")
        .leftJoinAndSelect("worker.user", "user")
        .leftJoinAndSelect("worker.branch", "branch")
        .where("user.id = :userId", { userId })
        .getOne();
      if (employee === null) throw new NotFoundError();
      if (employee.worker.branch.id !== studySession.course.branch.id) throw new ValidationError([]);
      // Check course isn't closed
      if (studySession.course.closingDate !== null) throw new ValidationError([]);
      // Check date
      const currentDate = new Date();
      currentDate.setHours(0);
      currentDate.setMinutes(0);
      currentDate.setSeconds(0);
      currentDate.setMilliseconds(0);
      if ((new Date(studySession.date)).getTime() < currentDate.getTime())
        throw new ValidationError([]);
      // Check current study session number > curriculum lectures
      const studySessionCount = await queryRunner.manager
        .createQueryBuilder(StudySession, "ss")
        .leftJoinAndSelect("ss.course", "course")
        .where("course.id = :courseId", { courseId: studySession.course.id })
        .getCount();
      if (studySession.course.curriculum.lectures.length >= studySessionCount) throw new ValidationError([]);
      // Teacher
      const teacherNotificationDto = {} as NotificationDto;
      teacherNotificationDto.userId = studySession.teacher.worker.user.id;
      teacherNotificationDto.content = `Buổi học "${studySession.name}", khoá học "${studySession.course.name}" đã bị hủy. Vui lòng vào trang web để kiểm tra thông tin.`;
      const teacherNotificationResult = await this.sendNotification(queryRunner, teacherNotificationDto);
      if (teacherNotificationResult.success && teacherNotificationResult.receiverSocketStatuses && teacherNotificationResult.receiverSocketStatuses.length) {
        notifications.push({
          socketIds: teacherNotificationResult.receiverSocketStatuses.map(socketStatus => socketStatus.socketId),
          notification: teacherNotificationResult.notification
        });
      }
      // Tutor
      const tutorNotificationDto = {} as NotificationDto;
      tutorNotificationDto.userId = studySession.tutor.worker.user.id;
      tutorNotificationDto.content = `Buổi học "${studySession.name}", khoá học "${studySession.course.name}" đã bị hủy. Vui lòng vào trang web để kiểm tra thông tin.`;
      const tutorNotificationResult = await this.sendNotification(queryRunner, tutorNotificationDto);
      if (tutorNotificationResult.success && tutorNotificationResult.receiverSocketStatuses && tutorNotificationResult.receiverSocketStatuses.length) {
        notifications.push({
          socketIds: tutorNotificationResult.receiverSocketStatuses.map(socketStatus => socketStatus.socketId),
          notification: tutorNotificationResult.notification
        });
      }
      // makeup lession
      const makeupLessons = await queryRunner.manager.createQueryBuilder(MakeUpLession, "mul")
        .leftJoinAndSelect("mul.student", "student")
        .leftJoinAndSelect("student.user", "user")
        .where("mul.targetStudySessionId = :targetStudySessionId", { targetStudySessionId: studySession.id })
        .getMany();
      for (const makeupLesson of makeupLessons) {
        const notificationDto = { userId: makeupLesson.student.user.id } as NotificationDto;
        notificationDto.content = `Buổi học bù "${studySession.name}", khoá học "${studySession.course.name}" đã bị hủy. Vui lòng lên website kiểm tra lại thông tin.`;
        const result = await this.sendNotification(queryRunner, notificationDto);
        if (result.success && result.receiverSocketStatuses && result.receiverSocketStatuses.length) {
          notifications.push({
            socketIds: result.receiverSocketStatuses.map(socketStatus => socketStatus.socketId),
            notification: result.notification
          });
        }
      }
      // Participations
      const participations = await queryRunner.manager
        .createQueryBuilder(StudentParticipateCourse, "p")
        .leftJoinAndSelect("p.student", "student")
        .leftJoinAndSelect("student.user", "user")
        .leftJoinAndSelect("p.course", "course")
        .where("course.id = :courseId", { courseId: studySession.course.id })
        .getMany();
      for (const participation of participations) {
        const notificationDto = { userId: participation.student.user.id } as NotificationDto;
        notificationDto.content = `Buổi học "${studySession.name}", khoá học "${studySession.course.name}" đã bị hủy. Vui lòng lên website kiểm tra lại thông tin.`;
        const result = await this.sendNotification(queryRunner, notificationDto);
        if (result.success && result.receiverSocketStatuses && result.receiverSocketStatuses.length) {
          notifications.push({
            socketIds: result.receiverSocketStatuses.map(socketStatus => socketStatus.socketId),
            notification: result.notification
          });
        }
      }
      // Commit transaction
      await queryRunner.manager.remove(studySession);
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


  async getClassrooms(userId?: number, pageableDto?: PageableDto, query?: string): Promise<{ total: number, classrooms: Classroom[] }> {
    const result = { total: 0, classrooms: [] as Classroom[] };
    if (userId === undefined || pageableDto === undefined || pageableDto === null) return result;
    const employee = await EmployeeRepository.findUserEmployeeByid(userId);
    if (employee === null) return result;

    const pageable = new Pageable(pageableDto);
    const [count, classrooms] = await Promise.all([
      ClassroomRepository.countClassroomByBranch(employee.worker.branch.id, query),
      ClassroomRepository.findClassroomByBranch(employee.worker.branch.id, pageable, query),
    ]);

    result.classrooms = classrooms;
    result.total = count;
    return result;
  }


  async addClassroom(userId?: number, classroomDto?: ClassroomDto): Promise<Classroom | null> {
    if (userId === undefined || classroomDto === null || classroomDto === undefined) return null;
    if (classroomDto.name === undefined || classroomDto.capacity === undefined ||
      classroomDto.function === undefined || classroomDto.branch === undefined)
      return null;

    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect()
    await queryRunner.startTransaction();
    try {
      // Check classroom belong to branch
      const employee = await queryRunner.manager
        .createQueryBuilder(UserEmployee, "employee")
        .setLock("pessimistic_read")
        .useTransaction(true)
        .leftJoinAndSelect("employee.worker", "worker")
        .leftJoinAndSelect("worker.user", "user")
        .leftJoinAndSelect("worker.branch", "branch")
        .where("user.id = :userId", { userId })
        .getOne();
      if (employee === null) throw new NotFoundError();
      if (employee.worker.branch.id !== classroomDto.branch) throw new ValidationError([]);
      // Check existing classroom
      const existedClassroom = await queryRunner.manager
        .createQueryBuilder(Classroom, "classroom")
        .setLock("pessimistic_write")
        .useTransaction(true)
        .leftJoinAndSelect("classroom.branch", "branch")
        .where("classroom.name = :name", { name: classroomDto.name })
        .andWhere("branch.id = :branchId", { branchId: classroomDto.branch })
        .getOne();
      if (existedClassroom !== null) throw new DuplicateError();
      // Create new existing classroom
      const classroom = new Classroom();
      classroom.name = classroomDto.name;
      classroom.branch = employee.worker.branch;
      classroom.function = classroomDto.function;
      classroom.capacity = classroomDto.capacity;
      // Validate entity
      const validateErrors = await validate(classroom);
      if (validateErrors.length) throw new ValidationError(validateErrors);
      // Commit transaction
      const savedClassroom = await queryRunner.manager.save(classroom);
      await queryRunner.commitTransaction();
      await queryRunner.release();
      return savedClassroom;
    } catch (error) {
      console.log(error);
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      return null;
    }
  }


  async modifyClassroom(userId?: number, classroomDto?: ClassroomDto): Promise<Classroom | null> {
    if (userId === undefined || classroomDto === null || classroomDto === undefined) return null;
    if (classroomDto.name === undefined || classroomDto.capacity === undefined ||
      classroomDto.function === undefined || classroomDto.branch === undefined ||
      classroomDto.oldName === undefined)
      return null;

    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect()
    await queryRunner.startTransaction();
    try {
      // Check classroom belong to branch
      const employee = await queryRunner.manager
        .createQueryBuilder(UserEmployee, "employee")
        .setLock("pessimistic_read")
        .useTransaction(true)
        .leftJoinAndSelect("employee.worker", "worker")
        .leftJoinAndSelect("worker.user", "user")
        .leftJoinAndSelect("worker.branch", "branch")
        .where("user.id = :userId", { userId })
        .getOne();
      if (employee === null) throw new NotFoundError();
      if (employee.worker.branch.id !== classroomDto.branch) throw new ValidationError([]);
      // Check existing classroom
      const existedClassroom = await queryRunner.manager
        .createQueryBuilder(Classroom, "classroom")
        .setLock("pessimistic_write")
        .useTransaction(true)
        .leftJoinAndSelect("classroom.branch", "branch")
        .where("classroom.name = :name", { name: classroomDto.oldName })
        .andWhere("branch.id = :branchId", { branchId: classroomDto.branch })
        .getOne();
      if (existedClassroom === null) throw new NotFoundError();
      // Check version
      if (existedClassroom.version !== classroomDto.version)
        throw new InvalidVersionColumnError();
      // Update existing classroom
      existedClassroom.name = classroomDto.name;
      existedClassroom.branch = employee.worker.branch;
      existedClassroom.function = classroomDto.function;
      existedClassroom.capacity = classroomDto.capacity;
      // Validate entity
      const validateErrors = await validate(existedClassroom);
      if (validateErrors.length) throw new ValidationError(validateErrors);
      // Commit transaction
      await queryRunner.manager.update(Classroom, {
        name: classroomDto.oldName, branch: classroomDto.branch
      }, existedClassroom);
      const updatedClassroom = await queryRunner.manager
        .createQueryBuilder(Classroom, "classroom")
        .setLock("pessimistic_read")
        .useTransaction(true)
        .leftJoinAndSelect("classroom.branch", "branch")
        .where("classroom.name = :name", { name: classroomDto.name })
        .andWhere("branch.id = :branchId", { branchId: classroomDto.branch })
        .getOne();
      await queryRunner.commitTransaction();
      await queryRunner.release();
      return updatedClassroom;
    } catch (error) {
      console.log(error);
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      return null;
    }
  }


  async removeClassroom(userId?: number, name?: string, branchId?: number): Promise<boolean> {
    if (userId === undefined || name === undefined || branchId === undefined) return false;

    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect()
    await queryRunner.startTransaction();
    try {
      // Check classroom belong to branch
      const employee = await queryRunner.manager
        .createQueryBuilder(UserEmployee, "employee")
        .setLock("pessimistic_read")
        .useTransaction(true)
        .leftJoinAndSelect("employee.worker", "worker")
        .leftJoinAndSelect("worker.user", "user")
        .leftJoinAndSelect("worker.branch", "branch")
        .where("user.id = :userId", { userId })
        .getOne();
      if (employee === null) throw new NotFoundError();
      if (employee.worker.branch.id !== branchId) throw new ValidationError([]);
      // Check existing classroom
      const existedClassroom = await queryRunner.manager
        .createQueryBuilder(Classroom, "classroom")
        .setLock("pessimistic_write")
        .useTransaction(true)
        .leftJoinAndSelect("classroom.branch", "branch")
        .where("classroom.name = :name", { name: name })
        .andWhere("branch.id = :branchId", { branchId: branchId })
        .getOne();
      if (existedClassroom === null) throw new NotFoundError();
      // Commit transaction
      await queryRunner.manager.remove(existedClassroom);
      await queryRunner.commitTransaction();
      await queryRunner.release();
      return true;
    } catch (error) {
      console.log(error);
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      return false;
    }
  }



  async getStudentsParicipateCourse(userId: number, courseSlug: string,
    query: string, pageableDto: PageableDto): Promise<{ total: number, students: UserStudent[] }> {
    if (userId === undefined || courseSlug === undefined ||
      pageableDto === null || pageableDto === undefined)
      return { total: 0, students: [] };
    const employee = await EmployeeRepository.findUserEmployeeByid(userId);
    if (employee === null) return { total: 0, students: [] };
    const course = await CourseRepository.findCourseBySlug(courseSlug);
    if (course === null) return { total: 0, students: [] };
    if (employee.worker.branch.id !== course.branch.id) return { total: 0, students: [] };

    const pageable = new Pageable(pageableDto);
    const [result, total] = await Promise.all([
      StudentParticipateCourseRepository.findStudentsByCourseSlug(courseSlug, pageable, query),
      StudentParticipateCourseRepository.countStudentsByCourseSlug(courseSlug, query)
    ]);
    return {
      total: total,
      students: result.map(r => r.student)
    };
  }


  async getAllStudents(userId: number, query: string, pageableDto: PageableDto, checkQuery?: boolean): Promise<{ total: number, students: UserStudent[] }> {
    if (userId === undefined || pageableDto === null || pageableDto === undefined)
      return { total: 0, students: [] };
    if (checkQuery && (query === undefined || query.trim().length === 0))
      return { total: 0, students: [] };
    const pageable = new Pageable(pageableDto);
    const [result, total] = await Promise.all([
      UserStudentRepository.findStudents(pageable, query),
      UserStudentRepository.countStudents(query)
    ]);
    return {
      total: total,
      students: result
    };
  }


  async getStudentDetails(userId: number, studentId: number): Promise<{ student: UserStudent }> {
    if (userId === undefined || studentId === undefined) throw new NotFoundError();
    const student = await UserStudentRepository.findStudentById(studentId);
    if (student === null) throw new NotFoundError();
    return { student };
  }


  async getAllParents(userId: number, query: string, pageableDto: PageableDto): Promise<{ total: number, parents: UserParent[] }> {
    if (userId === undefined || pageableDto === null || pageableDto === undefined)
      return { total: 0, parents: [] };
    if (query === undefined || query.trim().length === 0)
      return { total: 0, parents: [] };
    const pageable = new Pageable(pageableDto);
    const [result, total] = await Promise.all([
      UserParentRepository.findParents(pageable, query),
      UserParentRepository.countParents(query)
    ]);
    return {
      total: total,
      parents: result
    };
  }


  async modifyParent(userId: number, parentId: number, studentId: number, version: number): Promise<UserParent | null> {
    if (userId === undefined || parentId === undefined ||
      studentId === undefined || version === undefined)
      return null;

    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect()
    await queryRunner.startTransaction();
    try {
      // Get student
      const student = await queryRunner.manager
        .createQueryBuilder(UserStudent, "us")
        .setLock("pessimistic_write")
        .useTransaction(true)
        .leftJoinAndSelect("us.user", "user")
        .where("user.id = :studentId", { studentId })
        .getOne();
      if (student === null) throw new NotFoundError();
      if (student.version !== version)
        throw new InvalidVersionColumnError();
      // Get parents
      const parent = await queryRunner.manager
        .createQueryBuilder(UserParent, "up")
        .setLock("pessimistic_read")
        .useTransaction(true)
        .leftJoinAndSelect("up.user", "user")
        .where("user.id = :parentId", { parentId })
        .getOne();
      if (parent === null) throw new NotFoundError();
      student.userParent = parent;
      // Save and commit
      await queryRunner.manager.update(UserStudent, { user: studentId }, student);
      await queryRunner.commitTransaction();
      await queryRunner.release();
      return parent;
    } catch (error) {
      console.log(error);
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      return null;
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
    if (constants === null) throw new NotFoundError();
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


  async getFeeAmount(userId: number, courseSlug: string, studentId?: number): Promise<number> {
    if (userId === undefined || courseSlug === undefined) throw new NotFoundError();
    // Find employee
    const employee = await EmployeeRepository.findUserEmployeeByid(userId);
    if (employee === null) throw new NotFoundError();
    // Find course
    const course = await CourseRepository.findCourseBySlug(courseSlug);
    if (course === null) throw new NotFoundError();
    // Check branch of course and employee
    if (employee.worker.branch.id !== course.branch.id) throw new ValidationError([]);
    // Check course is not closed
    if (course.closingDate !== null) throw new ValidationError([]);
    // Calculating
    if (studentId === undefined)
      return (await this.caculateFeeAmount(course)).amount;
    // Participation
    const participation = await StudentParticipateCourse.createQueryBuilder('studentPaticipateCourses')
      .setLock("pessimistic_read")
      .useTransaction(true)
      .leftJoinAndSelect("studentPaticipateCourses.student", "student")
      .leftJoinAndSelect("student.user", "userStudent")
      .leftJoinAndSelect("studentPaticipateCourses.course", "course")
      .where("course.slug = :courseSlug", { courseSlug })
      .andWhere("userStudent.id = :studentId", { studentId })
      .getOne();
    if (participation === null) throw new NotFoundError();
    // Last fee
    const lastedFee = await Fee
      .createQueryBuilder("fee")
      .innerJoinAndSelect("fee.userStudent", "userStudent")
      .innerJoinAndSelect("userStudent.user", "user")
      .innerJoinAndSelect("fee.course", "course")
      .innerJoinAndSelect("fee.transCode", "transCode")
      .setLock("pessimistic_read")
      .useTransaction(true)
      .where("user.id = :studentId", { studentId })
      .andWhere("course.slug = :courseSlug", { courseSlug })
      .orderBy("transCode.payDate", "DESC")
      .getOne();
    if (lastedFee === null) throw new NotFoundError();
    // Check đóng tiền
    const today = new Date();
    const openingDate = new Date(course.openingDate);
    const billingDate = new Date(participation.billingDate);
    if (billingDate < today)
      throw new ValidationError([]); // "Học sinh cần thanh toán tiền phí nợ trước"
    // If course hasn't opened
    if (today < openingDate) return lastedFee.transCode.amount;
    // If course opened
    const amount = this.diffDays(billingDate, today) / this.diffDays(course.expectedClosingDate, course.openingDate) * course.price;
    return amount;
  }


  async addStudentParticipateCourse(userId: number, courseSlug: string, studentId: number): Promise<boolean> {
    const notifications: { socketIds: string[], notification: NotificationDto }[] = [];
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect()
    await queryRunner.startTransaction();

    try {
      if (userId === undefined || courseSlug === undefined || studentId === undefined)
        throw new NotFoundError();
      // Find employee
      const employee = await queryRunner.manager
        .createQueryBuilder(UserEmployee, "employee")
        .setLock("pessimistic_read")
        .useTransaction(true)
        .leftJoinAndSelect("employee.worker", "worker")
        .leftJoinAndSelect("worker.user", "user")
        .leftJoinAndSelect("worker.branch", "branch")
        .where("user.id = :userId", { userId })
        .getOne();
      if (employee === null) throw new NotFoundError();
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
        .where("course.slug = :courseSlug", { courseSlug })
        .getOne();
      if (course === null) throw new NotFoundError();
      // Find student
      const student = await queryRunner.manager
        .createQueryBuilder(UserStudent, "student")
        .setLock("pessimistic_read")
        .useTransaction(true)
        .leftJoinAndSelect("student.user", "user")
        .where("user.id = :studentId", { studentId })
        .getOne();
      if (student === null) throw new NotFoundError();
      // Check branch of course and employee
      if (employee.worker.branch.id !== course.branch.id) throw new ValidationError([]);
      // Check course is not closed
      if (course.closingDate !== null) throw new ValidationError([]);
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
      if (found) throw new DuplicateError();
      // Check max student number
      if (course.maxNumberOfStudent <= participations.length)
        throw new ValidationError([]);
      // Add participation
      const studentParticipateCourse = new StudentParticipateCourse();
      studentParticipateCourse.student = student;
      studentParticipateCourse.course = course;
      // Transaction
      const resultFee = await this.caculateFeeAmount(course);
      if (resultFee.amount > 0) {
        const transaction = new Transaction();
        transaction.transCode = faker.random.numeric(16);
        transaction.content = `Tiền học phí tháng ${resultFee.feeDate.getMonth() + 1}`;
        transaction.amount = resultFee.amount;
        transaction.type = TransactionType.Fee;
        transaction.branch = course.branch;
        transaction.payDate = new Date();
        transaction.userEmployee = employee;
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
      }
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
      // Teacher notification
      const teacherNotificationDto = {} as NotificationDto;
      teacherNotificationDto.userId = course.teacher.worker.user.id;
      teacherNotificationDto.content = `Học viên ${student.user.fullName} vừa được thêm vào khoá học "${course.name}". Vui lòng vào trang web để kiểm tra thông tin.`;
      const teacherNotificationResult = await this.sendNotification(queryRunner, teacherNotificationDto);
      if (teacherNotificationResult.success && teacherNotificationResult.receiverSocketStatuses && teacherNotificationResult.receiverSocketStatuses.length) {
        notifications.push({
          socketIds: teacherNotificationResult.receiverSocketStatuses.map(socketStatus => socketStatus.socketId),
          notification: teacherNotificationResult.notification
        });
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
      return false;
    }
  }


  async removeStudentParticipateCourse(userId: number, courseSlug: string, studentId: number): Promise<boolean> {
    const notifications: { socketIds: string[], notification: NotificationDto }[] = [];
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect()
    await queryRunner.startTransaction();

    try {
      if (userId === undefined || courseSlug === undefined || studentId === undefined)
        throw new NotFoundError();
      // Find employee
      const employee = await queryRunner.manager
        .createQueryBuilder(UserEmployee, "employee")
        .setLock("pessimistic_read")
        .useTransaction(true)
        .leftJoinAndSelect("employee.worker", "worker")
        .leftJoinAndSelect("worker.user", "user")
        .leftJoinAndSelect("worker.branch", "branch")
        .where("user.id = :userId", { userId })
        .getOne();
      if (employee === null) throw new NotFoundError();
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
        .where("course.slug = :courseSlug", { courseSlug })
        .getOne();
      if (course === null) throw new NotFoundError();
      // Find student
      const student = await queryRunner.manager
        .createQueryBuilder(UserStudent, "student")
        .setLock("pessimistic_read")
        .useTransaction(true)
        .leftJoinAndSelect("student.user", "user")
        .where("user.id = :studentId", { studentId })
        .getOne();
      if (student === null) throw new NotFoundError();
      // Check branch of course and employee
      if (employee.worker.branch.id !== course.branch.id) throw new ValidationError([]);
      // Check course is not closed
      if (course.closingDate !== null) throw new ValidationError([]);
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
      if (!found) throw new NotFoundError();
      // Remove participation
      await queryRunner.manager.remove(found);
      // Transaction
      const today = new Date();
      const openingDate = new Date(course.openingDate);
      const billingDate = new Date(found.billingDate);
      const currentDate = today < openingDate ? openingDate : today;
      const amount = this.diffDays(billingDate, currentDate) / this.diffDays(course.expectedClosingDate, course.openingDate) * course.price;

      if (amount > 0) {
        // Last fee
        const lastedFee = await queryRunner.manager
          .createQueryBuilder(Fee, "fee")
          .innerJoinAndSelect("fee.userStudent", "userStudent")
          .innerJoinAndSelect("userStudent.user", "user")
          .innerJoinAndSelect("fee.course", "course")
          .innerJoinAndSelect("fee.transCode", "transCode")
          .setLock("pessimistic_read")
          .useTransaction(true)
          .where("user.id = :studentId", { studentId })
          .andWhere("course.slug = :courseSlug", { courseSlug })
          .orderBy("transCode.payDate", "DESC")
          .getOne();
        if (lastedFee === null) throw new NotFoundError();
        // Amount
        const refundAmount = today < openingDate ? lastedFee.transCode.amount : amount;
        // Transaction
        const transaction = new Transaction();
        transaction.transCode = faker.random.numeric(16);
        transaction.content = `Hoàn phí khóa học "${course.name}"`;
        transaction.amount = refundAmount;
        transaction.type = TransactionType.Refund;
        transaction.branch = course.branch;
        transaction.payDate = new Date();
        transaction.userEmployee = employee;
        // Validation
        const transValidateErrors = await validate(transaction);
        if (transValidateErrors.length) throw new ValidationError(transValidateErrors);
        const savedTransaction = await queryRunner.manager.save(transaction);

        if (lastedFee.transCode.amount < refundAmount) throw new ValidationError([]);
        // Create Refund
        const refund = new Refund();
        refund.transCode = savedTransaction;
        refund.fee = lastedFee;
        // Validation
        const refundValidateErrors = await validate(transaction);
        if (refundValidateErrors.length) throw new ValidationError(refundValidateErrors);
        await queryRunner.manager.save(refund);
      }
      // Remove user attend study session
      const attendances = await queryRunner.manager
        .createQueryBuilder(UserAttendStudySession, "uas")
        .setLock("pessimistic_write")
        .useTransaction(true)
        .innerJoinAndSelect("uas.studySession", "studySession")
        .innerJoinAndSelect("studySession.course", "course")
        .innerJoinAndSelect("uas.student", "student")
        .innerJoinAndSelect("student.user", "user")
        .where("course.slug = :courseSlug", { courseSlug })
        .andWhere("user.id = :studentId", { studentId })
        .andWhere("studySession.date >= CURDATE()")
        .getMany();
      for (const attendance of attendances) {
        await queryRunner.manager.remove(attendance);
      }
      // Remove makeup study session
      const makeups = await queryRunner.manager
        .createQueryBuilder(MakeUpLession, "mul")
        .setLock("pessimistic_write")
        .useTransaction(true)
        .innerJoinAndSelect("mul.studySession", "studySession")
        .innerJoinAndSelect("studySession.course", "course")
        .innerJoinAndSelect("mul.student", "student")
        .innerJoinAndSelect("student.user", "user")
        .where("course.slug = :courseSlug", { courseSlug })
        .andWhere("user.id = :studentId", { studentId })
        .andWhere("studySession.date >= CURDATE()")
        .getMany();
      for (const makeup of makeups) {
        await queryRunner.manager.remove(makeup);
      }
      // Teacher notification
      const teacherNotificationDto = {} as NotificationDto;
      teacherNotificationDto.userId = course.teacher.worker.user.id;
      teacherNotificationDto.content = `Học viên ${student.user.fullName} vừa được xóa khỏi khoá học "${course.name}". Vui lòng vào trang web để kiểm tra thông tin.`;
      const teacherNotificationResult = await this.sendNotification(queryRunner, teacherNotificationDto);
      if (teacherNotificationResult.success && teacherNotificationResult.receiverSocketStatuses && teacherNotificationResult.receiverSocketStatuses.length) {
        notifications.push({
          socketIds: teacherNotificationResult.receiverSocketStatuses.map(socketStatus => socketStatus.socketId),
          notification: teacherNotificationResult.notification
        });
      }
      // Student notification
      const studentNotificationDto = {} as NotificationDto;
      studentNotificationDto.userId = student.user.id;
      studentNotificationDto.content = `Bạn vừa được xóa khỏi khoá học "${course.name}". Vui lòng vào trang web để kiểm tra thông tin.`;
      const studentNotificationResult = await this.sendNotification(queryRunner, studentNotificationDto);
      if (studentNotificationResult.success && studentNotificationResult.receiverSocketStatuses && studentNotificationResult.receiverSocketStatuses.length) {
        notifications.push({
          socketIds: studentNotificationResult.receiverSocketStatuses.map(socketStatus => socketStatus.socketId),
          notification: studentNotificationResult.notification
        });
      }
      // Commit 
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


  async getSalariesByBranch(userId: number, pageableDto: PageableDto, fromDate: Date, toDate: Date): Promise<{ total: number, salaries: Salary[] }> {
    if (userId === undefined || pageableDto === undefined || pageableDto === null) return { total: 0, salaries: [] };
    // Check is manager
    const isManager = BranchRepository.checkIsManager(userId);
    if (!isManager) return { total: 0, salaries: [] };
    // Find branch by employee
    const employee = await EmployeeRepository.findUserEmployeeByid(userId);
    if (employee === null) throw new NotFoundError();
    // Query data
    const pageable = new Pageable(pageableDto);
    const [total, salaries] = await Promise.all([
      SalaryRepository.countSalaryByBranch(employee.worker.branch.id, fromDate, toDate),
      SalaryRepository.findSalaryByBranch(employee.worker.branch.id, pageable, fromDate, toDate),
    ]);
    return { total, salaries };
  }


  async getFeeByBranch(userId: number, pageableDto: PageableDto, fromDate: Date, toDate: Date): Promise<{ total: number, fees: Fee[] }> {
    if (userId === undefined || pageableDto === undefined || pageableDto === null) return { total: 0, fees: [] };
    // Find branch by employee
    const employee = await EmployeeRepository.findUserEmployeeByid(userId);
    if (employee === null) throw new NotFoundError();
    // Query data
    const pageable = new Pageable(pageableDto);
    const [total, fees] = await Promise.all([
      FeeRepository.countFeeByBranch(employee.worker.branch.id, fromDate, toDate),
      FeeRepository.findFeeByBranch(employee.worker.branch.id, pageable, fromDate, toDate),
    ]);
    return { total, fees };
  }


  async getRefundByBranch(userId: number, pageableDto: PageableDto, fromDate: Date, toDate: Date): Promise<{ total: number, refunds: Refund[] }> {
    if (userId === undefined || pageableDto === undefined || pageableDto === null) return { total: 0, refunds: [] };
    // Find branch by employee
    const employee = await EmployeeRepository.findUserEmployeeByid(userId);
    if (employee === null) throw new NotFoundError();
    // Query data
    const pageable = new Pageable(pageableDto);
    const [total, refunds] = await Promise.all([
      RefundRepository.countRefundByBranch(employee.worker.branch.id, fromDate, toDate),
      RefundRepository.findRefundByBranch(employee.worker.branch.id, pageable, fromDate, toDate),
    ]);
    return { total, refunds };
  }


  async getTeacherByBranch(userId: number, query: string, pageableDto: PageableDto): Promise<{ total: number, teachers: UserTeacher[] }> {
    if (userId === undefined || pageableDto === undefined || pageableDto === null) return { total: 0, teachers: [] };
    // Find branch by employee
    const employee = await EmployeeRepository.findUserEmployeeByid(userId);
    if (employee === null) throw new NotFoundError();
    // Query data
    const pageable = new Pageable(pageableDto);
    const [total, teachers] = await Promise.all([
      UserTeacherRepository.countTeacherByBranch(employee.worker.branch.id, query),
      UserTeacherRepository.findTeacherByBranch(employee.worker.branch.id, pageable, query),
    ]);
    return { total, teachers };
  }


  async getTutorByBranch(userId: number, query: string, pageableDto: PageableDto): Promise<{ total: number, tutors: UserTutor[] }> {
    if (userId === undefined || pageableDto === undefined || pageableDto === null) return { total: 0, tutors: [] };
    // Find branch by employee
    const employee = await EmployeeRepository.findUserEmployeeByid(userId);
    if (employee === null) throw new NotFoundError();
    // Query data
    const pageable = new Pageable(pageableDto);
    const [total, tutors] = await Promise.all([
      TutorRepository.countTutorByBranch(employee.worker.branch.id, query),
      TutorRepository.findTutorByBranch(employee.worker.branch.id, pageable, query),
    ]);
    return { total, tutors };
  }


  async getEmployeeByBranch(userId: number, query: string, pageableDto: PageableDto): Promise<{ total: number, employees: UserEmployee[] }> {
    if (userId === undefined || pageableDto === undefined || pageableDto === null) return { total: 0, employees: [] };
    // Check is manager
    const isManager = BranchRepository.checkIsManager(userId);
    if (!isManager) return { total: 0, employees: [] };
    // Find branch by employee
    const employee = await EmployeeRepository.findUserEmployeeByid(userId);
    if (employee === null) throw new NotFoundError();
    // Query data
    const pageable = new Pageable(pageableDto);
    const [total, employees] = await Promise.all([
      EmployeeRepository.countEmployeeByBranch(employee.worker.branch.id, query),
      EmployeeRepository.findEmployeeByBranch(employee.worker.branch.id, pageable, query),
    ]);
    return { total, employees };
  }


  async checkStudentParticipateCourse(userId: number, courseSlug: string, studentId: number): Promise<boolean> {
    if (userId === undefined || courseSlug === undefined || studentId === undefined)
      throw new NotFoundError();
    // Find employee
    const employee = await EmployeeRepository.findUserEmployeeByid(userId);
    if (employee === null) throw new NotFoundError();
    // Find course
    const course = await CourseRepository.findCourseBySlug(courseSlug);
    if (course === null) throw new NotFoundError();
    // Find student
    const student = await UserStudentRepository.findStudentById(studentId);
    if (student === null) throw new NotFoundError();
    // Check branch of course and employee
    if (employee.worker.branch.id !== course.branch.id) throw new ValidationError([]);
    return await StudentParticipateCourseRepository.checkStudentParticipateCourse(studentId, courseSlug);
  }


  async createSalary(userId: number): Promise<boolean> {
    // Create
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect()
    await queryRunner.startTransaction();
    try {
      if (userId === undefined) throw new NotFoundError();
      // Check is manager
      const isManager = BranchRepository.checkIsManager(userId);
      if (!isManager) throw new ValidationError([]);
      // Find branch by employee
      const manager = await EmployeeRepository.findUserEmployeeByid(userId);
      if (manager === null) throw new NotFoundError();
      // Constants
      const constants = await queryRunner.manager
        .createQueryBuilder(TransactionConstants, "c")
        .setLock("pessimistic_read")
        .useTransaction(true)
        .getOne();
      if (constants === null) throw new NotFoundError();
      // Employees
      const employees = await queryRunner.manager
        .createQueryBuilder(UserEmployee, "em")
        .setLock("pessimistic_write")
        .useTransaction(true)
        .leftJoinAndSelect("em.worker", "worker")
        .leftJoinAndSelect("worker.user", "user")
        .leftJoinAndSelect("worker.branch", "branch")
        .where("branch.id = :branchId", { branchId: manager.worker.branch.id })
        .getMany();
      for (const employee of employees) {
        let currentDate = new Date(employee.worker.salaryDate);
        let salaryDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), constants.salaryDay);
        if (salaryDate <= currentDate) salaryDate.setMonth(salaryDate.getMonth() + 1);
        while (true) {
          if ((new Date()) < salaryDate) break;
          let amount = constants.baseSalary / 30 * this.diffDays(salaryDate, currentDate) * employee.worker.coefficients;
          // Create transaction
          const transaction = new Transaction();
          transaction.transCode = faker.random.numeric(16)
          transaction.content = `Tiền lương tháng ${salaryDate.getMonth() + 1}`;
          transaction.amount = amount;
          transaction.type = TransactionType.Salary;
          transaction.branch = employee.worker.branch;
          transaction.payDate = new Date();
          transaction.userEmployee = manager;
          // Validation
          const transValidateErrors = await validate(transaction);
          if (transValidateErrors.length) throw new ValidationError(transValidateErrors);
          const savedTransaction = await queryRunner.manager.save(transaction);
          // Create salary
          const salary = new Salary();
          salary.transCode = savedTransaction;
          salary.worker = employee.worker;
          // Validation
          const salaryValidateErrors = await validate(transaction);
          if (salaryValidateErrors.length) throw new ValidationError(salaryValidateErrors);
          await queryRunner.manager.save(salary);
          // Reset data
          currentDate = new Date(salaryDate);
          salaryDate.setMonth(salaryDate.getMonth() + 1);
        }
        employee.worker.salaryDate = new Date(currentDate);
        await queryRunner.manager.save(employee.worker);
        await queryRunner.manager.upsert(UserEmployee, employee, { conflictPaths: [], skipUpdateIfNoValuesChanged: true });
      }
      // Teacher
      const teachers = await queryRunner.manager
        .createQueryBuilder(UserTeacher, "em")
        .setLock("pessimistic_write")
        .useTransaction(true)
        .leftJoinAndSelect("em.worker", "worker")
        .leftJoinAndSelect("worker.user", "user")
        .leftJoinAndSelect("worker.branch", "branch")
        .where("branch.id = :branchId", { branchId: manager.worker.branch.id })
        .getMany();
      for (const teacher of teachers) {
        let currentDate = new Date(teacher.worker.salaryDate);
        let salaryDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), constants.salaryDay);
        if (salaryDate <= currentDate) salaryDate.setMonth(salaryDate.getMonth() + 1);
        while (true) {
          if ((new Date()) < salaryDate) break;
          // Query all study session
          const studySessions = await queryRunner.manager
            .createQueryBuilder(StudySession, 'ss')
            .setLock("pessimistic_write")
            .useTransaction(true)
            .leftJoinAndSelect("ss.course", "course")
            .leftJoinAndSelect("course.curriculum", "curriculum")
            .where("ss.date >= :beginingDate", { beginingDate: moment(currentDate).format("YYYY-MM-DD") })
            .andWhere("ss.date < :endingDate", { endingDate: moment(salaryDate).format("YYYY-MM-DD") })
            .andWhere("ss.teacherWorker = :teacherId", { teacherId: teacher.worker.user.id })
            .getMany();
          // Amount of fee
          let amount = 0;
          for (const ss of studySessions) {
            const [studentPaticipateCourseCount, lectureCount] = await Promise.all([
              queryRunner.manager
                .createQueryBuilder(StudentParticipateCourse, "spc")
                .setLock("pessimistic_read")
                .useTransaction(true)
                .where("spc.courseId = :courseId", { courseId: ss.course.id })
                .getCount(),
              queryRunner.manager
                .createQueryBuilder(Lecture, "lecture")
                .setLock("pessimistic_read")
                .useTransaction(true)
                .where("curriculumId = :curriculumId", { curriculumId: ss.course.curriculum.id })
                .getCount()
            ])
            const totalPrice = ss.course.price * studentPaticipateCourseCount;
            const numberOfSessions = lectureCount;  // Not count addition study sessions
            const pricePerSession = totalPrice / numberOfSessions;
            amount = amount + pricePerSession * constants.tutorProportion;
          }
          amount = amount + constants.baseSalary / 30 * this.diffDays(salaryDate, currentDate) * teacher.worker.coefficients;
          // Create transaction
          const transaction = new Transaction();
          transaction.transCode = faker.random.numeric(16)
          transaction.content = `Tiền lương tháng ${salaryDate.getMonth() + 1}`;
          transaction.amount = amount;
          transaction.type = TransactionType.Salary;
          transaction.branch = teacher.worker.branch;
          transaction.userEmployee = manager;
          transaction.payDate = new Date();
          // Validation
          const transValidateErrors = await validate(transaction);
          if (transValidateErrors.length) throw new ValidationError(transValidateErrors);
          const savedTransaction = await queryRunner.manager.save(transaction);
          // Create salary
          const salary = new Salary();
          salary.transCode = savedTransaction;
          salary.worker = teacher.worker;
          // Validation
          const salaryValidateErrors = await validate(transaction);
          if (salaryValidateErrors.length) throw new ValidationError(salaryValidateErrors);
          await queryRunner.manager.save(salary);
          // Reset data
          currentDate = new Date(salaryDate);
          salaryDate.setMonth(salaryDate.getMonth() + 1);
        }
        teacher.worker.salaryDate = new Date(currentDate);
        await queryRunner.manager.save(teacher.worker);
        await queryRunner.manager.upsert(UserTeacher, teacher, { conflictPaths: [], skipUpdateIfNoValuesChanged: true });
      }
      // Tutors
      const tutors = await queryRunner.manager
        .createQueryBuilder(UserTutor, "em")
        .setLock("pessimistic_write")
        .useTransaction(true)
        .leftJoinAndSelect("em.worker", "worker")
        .leftJoinAndSelect("worker.user", "user")
        .leftJoinAndSelect("worker.branch", "branch")
        .where("branch.id = :branchId", { branchId: manager.worker.branch.id })
        .getMany();
      for (const tutor of tutors) {
        let currentDate = new Date(tutor.worker.salaryDate);
        let salaryDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), constants.salaryDay);
        if (salaryDate <= currentDate) salaryDate.setMonth(salaryDate.getMonth() + 1);
        while (true) {
          if ((new Date()) < salaryDate) break;
          // Query all study session
          const studySessions = await queryRunner.manager
            .createQueryBuilder(StudySession, 'ss')
            .setLock("pessimistic_write")
            .useTransaction(true)
            .leftJoinAndSelect("ss.course", "course")
            .leftJoinAndSelect("course.curriculum", "curriculum")
            .where("ss.date >= :beginingDate", { beginingDate: moment(currentDate).format("YYYY-MM-DD") })
            .andWhere("ss.date < :endingDate", { endingDate: moment(salaryDate).format("YYYY-MM-DD") })
            .andWhere("ss.tutorWorker = :tutorId", { tutorId: tutor.worker.user.id })
            .getMany();
          // Amount of fee
          let amount = 0;
          for (const ss of studySessions) {
            const [studentPaticipateCourseCount, lectureCount] = await Promise.all([
              queryRunner.manager
                .createQueryBuilder(StudentParticipateCourse, "spc")
                .setLock("pessimistic_read")
                .useTransaction(true)
                .where("spc.courseId = :courseId", { courseId: ss.course.id })
                .getCount(),
              queryRunner.manager
                .createQueryBuilder(Lecture, "lecture")
                .setLock("pessimistic_read")
                .useTransaction(true)
                .where("curriculumId = :curriculumId", { curriculumId: ss.course.curriculum.id })
                .getCount()
            ])
            const totalPrice = ss.course.price * studentPaticipateCourseCount;
            const numberOfSessions = lectureCount;  // Not count addition study sessions
            const pricePerSession = totalPrice / numberOfSessions;
            amount = amount + pricePerSession * constants.tutorProportion;
          }
          amount = amount + constants.baseSalary / 30 * this.diffDays(salaryDate, currentDate) * tutor.worker.coefficients;
          // Create transaction
          const transaction = new Transaction();
          transaction.transCode = faker.random.numeric(16)
          transaction.content = `Tiền lương tháng ${salaryDate.getMonth() + 1}`;
          transaction.amount = amount;
          transaction.type = TransactionType.Salary;
          transaction.branch = tutor.worker.branch;
          transaction.payDate = new Date();
          transaction.userEmployee = manager;
          // Validation
          const transValidateErrors = await validate(transaction);
          if (transValidateErrors.length) throw new ValidationError(transValidateErrors);
          const savedTransaction = await queryRunner.manager.save(transaction);
          // Create salary
          const salary = new Salary();
          salary.transCode = savedTransaction;
          salary.worker = tutor.worker;
          // Validation
          const salaryValidateErrors = await validate(transaction);
          if (salaryValidateErrors.length) throw new ValidationError(salaryValidateErrors);
          await queryRunner.manager.save(salary);
          // Reset data
          currentDate = new Date(salaryDate);
          salaryDate.setMonth(salaryDate.getMonth() + 1);
        }
        tutor.worker.salaryDate = new Date(currentDate);
        await queryRunner.manager.save(tutor.worker);
        await queryRunner.manager.upsert(UserTutor, tutor, { conflictPaths: [], skipUpdateIfNoValuesChanged: true });
        await tutor.reload();
      }
      // Remove study session
      let currentDate = new Date();
      let salaryDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), constants.salaryDay);
      if (salaryDate > currentDate) salaryDate.setMonth(salaryDate.getMonth() - 1);
      const studySessions = await queryRunner.manager
        .createQueryBuilder(StudySession, 'ss')
        .setLock("pessimistic_write")
        .useTransaction(true)
        .leftJoinAndSelect("ss.teacher", "teacher")
        .leftJoinAndSelect("teacher.worker", "teacherWorker")
        .leftJoinAndSelect("ss.tutor", "tutor")
        .leftJoinAndSelect("tutor.worker", "tutorWorker")
        .where("ss.courseId IS NULL")
        .andWhere("ss.date < :endingDate", { endingDate: moment(salaryDate).format("YYYY-MM-DD") })
        .andWhere("teacherWorker.salaryDate >= :teacherSalaryDate", { teacherSalaryDate: moment(salaryDate).format("YYYY-MM-DD") })
        .andWhere("tutorWorker.salaryDate >= :tutorSalaryDate", { tutorSalaryDate: moment(salaryDate).format("YYYY-MM-DD") })
        .getMany();
      for (const studySession of studySessions)
        await queryRunner.manager.remove(studySession);
      // Commit data
      await queryRunner.commitTransaction();
      await queryRunner.release();
      // Send data
      const socketStatuses = await SocketStatusRepository.findAllSocketConnByUser(userId);
      socketStatuses.forEach(ss => {
        io.to(ss.socketId).emit("create_salary_completed");
      });
      // Return
      return true;
    } catch (error) {
      console.log(error);
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      if (userId) {
        const socketStatuses = await SocketStatusRepository.findAllSocketConnByUser(userId);
        socketStatuses.forEach(ss => {
          io.to(ss.socketId).emit("create_salary_failed");
        });
      }
      return false;
    }
  }


  async getLateFeeStudent(userId: number, pageableDto: PageableDto): Promise<{ total: number, students: UserStudent[] }> {
    if (userId === undefined || pageableDto === null || pageableDto === undefined)
      return { total: 0, students: [] };
    // Check employee
    const employee = await EmployeeRepository.findUserEmployeeByid(userId);
    if (employee === null) throw new NotFoundError();
    // Query
    const pageable = new Pageable(pageableDto);
    const [total, result] = await Promise.all([
      UserStudentRepository.countLateFeeStudent(employee.worker.branch.id),
      UserStudentRepository.getLateFeeStudent(employee.worker.branch.id, pageable),
    ]);
    return {
      total: total,
      students: result,
    };
  }


  async notifyLateFeeStudent(userId: number, studentId?: number): Promise<boolean> {
    if (userId === undefined) return false;
    // Check employee
    const employee = await EmployeeRepository.findUserEmployeeByid(userId);
    if (employee === null) throw new NotFoundError();
    // Notifications container
    const notifications: { socketIds: string[], notification: NotificationDto }[] = [];
    // Query runner
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect()
    await queryRunner.startTransaction()
    try {
      // Send notifications
      if (studentId !== undefined) {
        const notificationDto = { userId: studentId } as NotificationDto;
        notificationDto.content = `Bạn đang nợ học phí trung tâm. Vui lòng thanh toán sớm nhất có thể.`;
        const result = await this.sendNotification(queryRunner, notificationDto);
        if (result.success && result.receiverSocketStatuses && result.receiverSocketStatuses.length) {
          notifications.push({
            socketIds: result.receiverSocketStatuses.map(socketStatus => socketStatus.socketId),
            notification: result.notification
          });
        }
      } else {
        const total = await UserStudentRepository.countLateFeeStudent(employee.worker.branch.id);
        let current = 0;
        while (current < total) {
          const pageable = new Pageable({ skip: current, limit: 12 });
          const students = await UserStudentRepository.getLateFeeStudent(employee.worker.branch.id, pageable);
          current = current + students.length;
          for (const student of students) {
            const notificationDto = { userId: student.user.id } as NotificationDto;
            notificationDto.content = `Bạn đang nợ học phí trung tâm. Vui lòng thanh toán sớm nhất có thể.`;
            const result = await this.sendNotification(queryRunner, notificationDto);
            if (result.success && result.receiverSocketStatuses && result.receiverSocketStatuses.length) {
              notifications.push({
                socketIds: result.receiverSocketStatuses.map(socketStatus => socketStatus.socketId),
                notification: result.notification
              });
            }
          }
        }
      }
      // Commit transactions
      await queryRunner.commitTransaction();
      await queryRunner.release();
      // Send notifications
      notifications.forEach(notification => {
        notification.socketIds.forEach(id => {
          io.to(id).emit("notification", notification.notification);
        });
      });
      return true;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      return false;
    }
  }


  async getUnpaidFee(userId: number, studentId: number): Promise<UnpaidDto[]> {
    if (userId === undefined) throw new NotFoundError();
    // Check employee
    const employee = await EmployeeRepository.findUserEmployeeByid(userId);
    if (employee === null) throw new NotFoundError();
    // Get transaction constants
    const constants = await TransactionConstantsRepository.find();
    if (constants === null) throw new NotFoundError();
    // Calculate unpaid fee
    const result: UnpaidDto[] = []
    const participations = await StudentParticipateCourseRepository.findUnpaidFeeByStudentAndBranch(studentId, employee.worker.branch.id);
    for (const participation of participations) {
      let isFinished = false;
      const expectedClosingDate = new Date(participation.course.expectedClosingDate);
      let currentDate = new Date(participation.billingDate);
      currentDate.setHours(0);
      currentDate.setMinutes(0);
      currentDate.setSeconds(0);
      currentDate.setMilliseconds(0);

      let feeDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), constants.feeDay);
      if (feeDate <= currentDate) feeDate.setMonth(feeDate.getMonth() + 1);
      if (this.diffDays(feeDate, currentDate) < 10) feeDate.setMonth(feeDate.getMonth() + 1);
      while (true) {
        if ((new Date()) < feeDate) isFinished = true;
        if (expectedClosingDate <= feeDate) {
          feeDate = new Date(expectedClosingDate);
          feeDate.setHours(0);
          feeDate.setMinutes(0);
          feeDate.setSeconds(0);
          feeDate.setMilliseconds(0);
          isFinished = true;
        } else if (this.diffDays(expectedClosingDate, feeDate) < 10) {
          feeDate = new Date(expectedClosingDate);
          feeDate.setHours(0);
          feeDate.setMinutes(0);
          feeDate.setSeconds(0);
          feeDate.setMilliseconds(0);
          isFinished = true;
        }
        const amount = this.diffDays(feeDate, currentDate) / this.diffDays(
          expectedClosingDate, participation.course.openingDate) * participation.course.price;
        if (amount > 0) {
          const unpaid = new UnpaidDto();
          unpaid.amount = amount;
          unpaid.course = participation.course;
          unpaid.student = participation.student;
          unpaid.fromDate = new Date(currentDate);
          unpaid.toDate = new Date(feeDate);
          result.push(unpaid);
        }

        if (isFinished) break;
        currentDate = new Date(feeDate);
        feeDate.setMonth(feeDate.getMonth() + 1);
      }
    }
    result.sort((a, b) => {
      if (a.fromDate < b.fromDate) return -1;
      if (a.fromDate > b.fromDate) return 1;
      return 0;
    })
    return result;
  }


  async payFee(userId: number, studentId: number,
    courseSlug: string, fromDate: Date, toDate: Date, amount: number): Promise<boolean> {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect()
    await queryRunner.startTransaction()
    try {
      if (userId === undefined || studentId === undefined ||
        courseSlug === undefined || fromDate === undefined ||
        toDate === undefined || amount === undefined) throw new NotFoundError();
      // Check employee
      const employee = await queryRunner.manager
        .createQueryBuilder(UserEmployee, "employee")
        .setLock("pessimistic_read")
        .useTransaction(true)
        .leftJoinAndSelect("employee.worker", "worker")
        .leftJoinAndSelect("worker.user", "user")
        .leftJoinAndSelect("worker.branch", "branch")
        .where("user.id = :userId", { userId })
        .getOne();
      if (employee === null) throw new NotFoundError();
      // Course participation
      const participation = await queryRunner.manager
        .createQueryBuilder(StudentParticipateCourse, 'studentPaticipateCourses')
        .setLock("pessimistic_write")
        .useTransaction(true)
        .leftJoinAndSelect("studentPaticipateCourses.student", "student")
        .leftJoinAndSelect("student.user", "userStudent")
        .leftJoinAndSelect("studentPaticipateCourses.course", "course")
        .leftJoinAndSelect("course.branch", "branch")
        .where("course.slug = :courseSlug", { courseSlug })
        .andWhere("userStudent.id = :studentId", { studentId })
        .getOne();
      if (participation === null) throw new NotFoundError();
      // Check branch
      if (employee.worker.branch.id !== participation.course.branch.id)
        throw new ValidationError([]);
      // Check billingDate
      const billingDate = new Date(participation.billingDate);
      const expectedClosingDate = new Date(participation.course.expectedClosingDate);
      const fromDateDto = new Date(fromDate);
      const toDateDto = new Date(toDate);
      if (billingDate.getFullYear() !== fromDateDto.getFullYear() ||
        billingDate.getMonth() !== fromDateDto.getMonth() ||
        billingDate.getDate() !== fromDateDto.getDate())
        throw new ValidationError([]);
      if (expectedClosingDate < toDateDto)
        throw new ValidationError([]);
      // Check amount
      const expectedAmount = this.diffDays(fromDateDto, toDateDto) / this.diffDays(
        participation.course.expectedClosingDate, participation.course.openingDate) * participation.course.price;
      if (Math.ceil(expectedAmount) !== Math.ceil(amount))
        throw new ValidationError([]);
      // Create transaction
      if (expectedAmount > 0) {
        const transaction = new Transaction();
        transaction.transCode = faker.random.numeric(16);
        transaction.content = `Tiền học phí tháng ${toDateDto.getMonth() + 1}`;
        transaction.amount = expectedAmount;
        transaction.type = TransactionType.Fee;
        transaction.branch = participation.course.branch;
        transaction.payDate = new Date();
        transaction.userEmployee = employee;
        // Validate entity
        const transValidateErrors = await validate(transaction);
        if (transValidateErrors.length) throw new ValidationError(transValidateErrors);
        // Save data
        const savedTransaction = await queryRunner.manager.save(transaction);
        // Create free
        const fee = new Fee();
        fee.transCode = savedTransaction;
        fee.userStudent = participation.student;
        fee.course = participation.course;
        // Validate entity
        const feeValidateErrors = await validate(fee);
        if (feeValidateErrors.length) throw new ValidationError(feeValidateErrors);
        // Save data
        await queryRunner.manager.save(fee)
      }
      participation.billingDate = new Date(toDateDto);
      await queryRunner.manager.upsert(StudentParticipateCourse, participation, { conflictPaths: [], skipUpdateIfNoValuesChanged: true })

      await queryRunner.commitTransaction();
      await queryRunner.release();
      return true;
    } catch (error) {
      console.log(error);
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      return false;
    }
  }
}


export const EmployeeService = new EmployeeServiceImpl();