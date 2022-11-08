import { PageableDto, CourseListDto, DocumentDto, CourseDetailDto, FileDto, CredentialDto } from "../../dto";
import { Course } from "../../entities/Course";
import { AccountRepository, CourseRepository, Pageable, Sortable } from "../../repositories";
import ExerciseRepository from "../../repositories/exercise/exercise.repository.impl";
import DocumentRepository from "../../repositories/document/document.repository.impl";
import Queryable from "../../utils/common/queryable.interface";
import TeacherServiceInterface from "./teacher.service.interface";
import { Document } from "../../entities/Document";
import { ValidationError } from "../../utils/errors/validation.error";
import { DOCUMENT_DESTINATION_SRC } from "../../utils/constants/document.constant";
import { UserTeacher } from "../../entities/UserTeacher";
import { NotFoundError } from "../../utils/errors/notFound.error";
import UserTeacherRepository from "../../repositories/userTeacher/userTeachere.repository.impl";
import { AVATAR_DESTINATION_SRC } from "../../utils/constants/avatar.constant";
import * as path from "path";
import * as fs from "fs";
import * as jwt from "jsonwebtoken";
import { AppDataSource } from "../../utils/functions/dataSource";
import { InvalidVersionColumnError } from "../../utils/errors/invalidVersionColumn.error";
import { Curriculum } from "../../entities/Curriculum";
import CurriculumRepository from "../../repositories/curriculum/curriculum.repository.impl";
import CurriculumDto from "../../dto/requests/curriculum.dto";
import { CURRICULUM_DESTINATION_SRC } from "../../utils/constants/curriculum.constant";
import { Lecture } from "../../entities/Lecture";
import { validate } from "class-validator";
import { UserStudent } from "../../entities/UserStudent";
import StudentParticipateCourseRepository from "../../repositories/studentParticipateCourse/studentParticipateCourse.repository.impl";
import { Exercise } from "../../entities/Exercise";
import MaskedComment from "../../dto/responses/maskedComment.dto";
import { getExerciseStatus } from "../../utils/functions/getExerciseStatus";
import { ExerciseStatus } from "../../utils/constants/exercise.constant";
import { Question } from "../../entities/Question";
import { WrongAnswer } from "../../entities/WrongAnswer";
import { Tag } from "../../entities/Tag";
import { DuplicateError } from "../../utils/errors/duplicate.error";
import { TagsType } from "../../utils/constants/tags.constant";
import { StudySession } from "../../entities/StudySession";
import StudySessionRepository from "../../repositories/studySession/studySession.repository.impl";
import { StudentDoExercise } from "../../entities/StudentDoExercise";
import { UserAttendStudySession } from "../../entities/UserAttendStudySession";
import UserStudentRepository from "../../repositories/userStudent/userStudent.repository.impl";
import StudentDoExerciseRepository from "../../repositories/studentDoExercise/studentDoExercise.repository.impl";
import UserAttendStudySessionRepository from "../../repositories/userAttendStudySession/userAttendStudySession.repository.impl";
import { MakeUpLession } from "../../entities/MakeUpLession";
import MakeUpLessionRepository from "../../repositories/makeUpLesson/makeUpLesson.repository.impl";
import { TeacherPreferCurriculum } from "../../entities/TeacherPreferCurriculum";
import TeacherPreferCurriculumRepository from "../../repositories/teacherPreferCurriculum/teacherPreferCurriculum.repository.impl";
import { getStudySessionState } from "../../utils/functions/getStudySessionState";
import { StudySessionState } from "../../utils/constants/studySessionState.constant";
import moment = require("moment");
import EmployeeRepository from "../../repositories/userEmployee/employee.repository.impl";
import { UserEmployee } from "../../entities/UserEmployee";
import TagRepository from "../../repositories/tag/tag.repository.impl";
import { slugify } from "../../utils/functions/slugify";


class TeacherServiceImpl implements TeacherServiceInterface {
  async getCoursesByTeacher(teacherId: number, pageableDto: PageableDto, queryable: Queryable<Course>): Promise<CourseListDto> {
    const sortable = new Sortable()
      .add("openingDate", "DESC")
      .add("Course.name", "ASC");
    const pageable = new Pageable(pageableDto);
    const [courseCount, courseList] = await Promise.all([
      CourseRepository.countCourseByTeacher(queryable, teacherId),
      CourseRepository.findCourseByTeacher(pageable, sortable, queryable, teacherId)
    ]);
    const courseListDto = new CourseListDto();
    courseListDto.courses = courseList;
    courseListDto.limit = pageable.limit;
    courseListDto.skip = pageable.offset;
    courseListDto.total = courseCount;
    return courseListDto;
  }


  async getCourseDetail(teacherId: number, courseSlug: string): Promise<Partial<CourseDetailDto> | null> {
    const course = await CourseRepository.findCourseBySlug(courseSlug);
    if (course === null) return null;
    // Check permissions
    const courseIds = await StudySessionRepository.findCourseIdsByTeacherId(teacherId);
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

    const courseIds = await StudySessionRepository.findCourseIdsByTeacherId(userId);
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


  async getStudentDetailsInCourse(userId: number, studentId: number,
    courseSlug: string): Promise<{ student: UserStudent, doExercises: StudentDoExercise[], attendences: UserAttendStudySession[], makeUpLessons: MakeUpLession[] }> {
    if (userId === undefined) throw new NotFoundError();
    const course = await CourseRepository.findCourseBySlug(courseSlug);
    if (course === null) throw new NotFoundError();

    const courseIds = await StudySessionRepository.findCourseIdsByTeacherId(userId);
    const foundId = courseIds.find(object => object.id === course.id);
    if (!foundId) throw new ValidationError([]);
    if (!StudentParticipateCourseRepository.checkStudentParticipateCourse(studentId, courseSlug))
      throw new ValidationError([]);

    const isSameTeacher = course.teacher.worker.user.id === userId;
    const [student, doExercises, attendences, makeUpLessons] = await Promise.all([
      UserStudentRepository.findStudentById(studentId),
      isSameTeacher ? StudentDoExerciseRepository.findMaxScoreDoExerciseByStudentAndCourse(studentId, courseSlug) : [],
      UserAttendStudySessionRepository.findAttendenceByStudentAndCourse(studentId, courseSlug, isSameTeacher ? undefined : userId),
      MakeUpLessionRepository.findByStudentAndCourse(studentId, courseSlug, isSameTeacher ? undefined : userId),
    ]);
    if (student === null) throw new NotFoundError();
    return { student, doExercises, attendences, makeUpLessons };
  }


  async getExercises(userId: number, courseSlug: string, pageableDto: PageableDto): Promise<{ total: number, exercises: Exercise[] }> {
    if (userId === undefined) return { total: 0, exercises: [] };
    const course = await CourseRepository.findCourseBySlug(courseSlug);
    if (course?.teacher.worker.user.id !== userId) return { total: 0, exercises: [] };

    const pageable = new Pageable(pageableDto);
    const result = await ExerciseRepository.findExercisesByCourseSlug(courseSlug, pageable);
    const total = await ExerciseRepository.countExercisesByCourseSlug(courseSlug);
    return {
      total: total,
      exercises: result
    };
  }



  async deleteExercise(teacherId: number, exerciseId: number): Promise<boolean> {
    if (teacherId === undefined) return false;
    const exercise = await ExerciseRepository.findExerciseById(exerciseId);
    if (exercise === null) return false;
    if (exercise.course.teacher.worker.user.id !== teacherId) return false;
    if (exercise.course.closingDate !== null && exercise.course.closingDate !== undefined)
      return false;
    if (getExerciseStatus(exercise.openTime, exercise.endTime) === ExerciseStatus.Opened)
      return false;
    const result = await ExerciseRepository.deleteExercise(exerciseId);
    return result;
  }


  async getDocuments(userId: number, courseSlug: string, pageableDto: PageableDto): Promise<{ total: number, documents: Document[] }> {
    if (userId === undefined) return { total: 0, documents: [] };
    const course = await CourseRepository.findCourseBySlug(courseSlug);
    if (course?.teacher.worker.user.id !== userId) return { total: 0, documents: [] };

    const pageable = new Pageable(pageableDto);
    const result = await DocumentRepository.findDocumentsByCourseSlug(courseSlug, pageable);
    const total = await DocumentRepository.countDocumentsByCourseSlug(courseSlug);
    return {
      total: total,
      documents: result
    };
  }


  async deleteDocument(teacherId: number, documentId: number): Promise<boolean> {
    if (teacherId === undefined) return false;

    const document = await DocumentRepository.findDocumentById(documentId);
    if (document === null) return false;
    if (document.course.teacher.worker.user.id !== teacherId) return false;
    if (document.course.closingDate !== null && document.course.closingDate !== undefined)
      return false;
    const result = await DocumentRepository.deleteDocument(documentId);
    if (document.src) {
      const filePath = path.join(process.cwd(), "public", document.src);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    return result;
  }

  async createDocument(userId: number, documentDto: DocumentDto): Promise<Document | null> {
    if (userId === undefined) return null;

    if (documentDto.courseSlug === undefined)
      throw new ValidationError([]);
    const course = await CourseRepository.findCourseBySlug(documentDto.courseSlug);
    if (course === null)
      throw new ValidationError([]);

    if (course.teacher.worker.user.id !== userId) return null;
    if (course.closingDate !== null && course.closingDate !== undefined)
      return null;

    let documentSrc = "";
    if (documentDto.documentType === "link" && documentDto.documentLink)
      documentSrc = documentDto.documentLink;
    else if (documentDto.documentType === "file" && documentDto.documentFile && documentDto.documentFile.fieldname)
      documentSrc = DOCUMENT_DESTINATION_SRC + documentDto.documentFile.filename;
    else throw new ValidationError([]);

    return await DocumentRepository.createDocument(
      documentDto.documentName,
      documentSrc,
      course,
      documentDto.documentAuthor || null,
      documentDto.documentYear || null,
    );
  }


  async getComment(userId: number, courseSlug: string, pageableDto: PageableDto):
    Promise<{ total: number, average: number, starTypeCount: object, comments: MaskedComment[] }> {
    const result = { total: 0, average: 0, starTypeCount: {}, comments: [] };

    if (userId === undefined) return result;
    const course = await CourseRepository.findCourseBySlug(courseSlug);
    if (course?.teacher.worker.user.id !== userId) return result;
    if (course.closingDate === null || course.closingDate === undefined) return result;

    const pageable = new Pageable(pageableDto);
    const [total, average, starTypeCount, comments] = await Promise.all([
      StudentParticipateCourseRepository.countCommentsByCourseSlug(courseSlug),
      StudentParticipateCourseRepository.getAverageStarPointByCourseSlug(courseSlug),
      StudentParticipateCourseRepository.countStarPointsTypeByCourseSlug(courseSlug),
      StudentParticipateCourseRepository.getCommentsByCourseSlug(courseSlug, pageable)
    ]);

    const maskedComment = comments
      .map(participation => ({
        comment: participation.comment,
        starPoint: participation.starPoint,
        userFullName: participation.isIncognito ? "Người dùng đã ẩn danh" : participation.student.user.fullName,
        commentDate: participation.commentDate
      }));
    return { total, average: average, starTypeCount, comments: maskedComment };
  }



  async getStudySessions(teacherId: number, courseSlug: string,
    pageableDto: PageableDto): Promise<{ total: number, studySessions: StudySession[] }> {
    if (teacherId === undefined) return { total: 0, studySessions: [] };
    const course = await CourseRepository.findCourseBySlug(courseSlug);
    if (course === null) return { total: 0, studySessions: [] };

    const courseIds = await StudySessionRepository.findCourseIdsByTeacherId(teacherId);
    const foundId = courseIds.find(object => object.id === course.id);
    if (!foundId) return { total: 0, studySessions: [] };

    const isSameTeacher = course.teacher.worker.user.id === teacherId
    const pageable = new Pageable(pageableDto);
    const result = await StudySessionRepository.findStudySessionsByCourseSlugAndTeacher(courseSlug, pageable, isSameTeacher ? undefined : teacherId);
    const total = await StudySessionRepository.countStudySessionsByCourseSlugAndTeacher(courseSlug, isSameTeacher ? undefined : teacherId);
    return {
      total: total,
      studySessions: result,
    };
  }


  async getStudySessionDetail(teacherId?: number, studySessionId?: number):
    Promise<{ studySession: StudySession | null, attendences: UserAttendStudySession[], makeups: MakeUpLession[], ownMakeups: MakeUpLession[] }> {
    const result = {
      studySession: null as StudySession | null,
      attendences: [] as UserAttendStudySession[],
      makeups: [] as MakeUpLession[],
      ownMakeups: [] as MakeUpLession[],
    };
    if (teacherId === undefined || studySessionId === undefined) return result;
    result.studySession = await StudySessionRepository.findStudySessionById(studySessionId);
    if (result.studySession === null) return result;
    if (result.studySession.teacher.worker.user.id !== teacherId &&
      result.studySession.course.teacher.worker.user.id !== teacherId) {
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


  async modifyStudySessionDetail(teacherId?: number, studySession?: StudySession, attendences?: UserAttendStudySession[], makeups?: MakeUpLession[]): Promise<boolean> {
    if (teacherId === undefined || studySession === undefined || attendences === undefined || makeups === undefined) return false;
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect()
    await queryRunner.startTransaction();
    try {
      const foundStudySession = await queryRunner.manager
        .createQueryBuilder(StudySession, "ss")
        .setLock("pessimistic_write")
        .useTransaction(true)
        .leftJoinAndSelect("ss.course", "course")
        .leftJoinAndSelect("ss.teacher", "teacher")
        .leftJoinAndSelect("teacher.worker", "teacherWorker")
        .leftJoinAndSelect("teacherWorker.user", "teacherUser")
        .leftJoinAndSelect("ss.shifts", "shifts")
        .where("ss.id = :studySessionId", { studySessionId: studySession.id })
        .orderBy({
          "shifts.weekDay": "ASC",
          "shifts.startTime": "ASC",
        }).getOne();
      if (foundStudySession === null || foundStudySession.teacher.worker.user.id !== teacherId)
        throw new NotFoundError();
      // Check course and studySession state
      if (getStudySessionState(foundStudySession) === StudySessionState.Ready)
        throw new ValidationError([]);
      if (foundStudySession.course.closingDate !== null)
        throw new ValidationError([]);
      // Update study session
      if (foundStudySession.version !== studySession.version)
        throw new InvalidVersionColumnError();
      foundStudySession.notes = studySession.notes;
      const savedStudySession = await queryRunner.manager.save(foundStudySession);
      if (savedStudySession.version !== studySession.version + 1
        && savedStudySession.version !== studySession.version)
        throw new InvalidVersionColumnError();
      // Update attendences
      for (let index = 0; index < attendences.length; index++) {
        const attendence = attendences[index];
        if (attendence.studySession.id !== studySession.id)
          throw new ValidationError([]);
        const foundAttendence = await queryRunner.manager
          .createQueryBuilder(UserAttendStudySession, "a")
          .setLock("pessimistic_write")
          .useTransaction(true)
          .leftJoinAndSelect("a.studySession", "studySession")
          .leftJoinAndSelect("a.student", "student")
          .leftJoinAndSelect("student.user", "user")
          .where("studySession.id = :studySessionId", { studySessionId: attendence.studySession.id })
          .andWhere("user.id = :userId", { userId: attendence.student.user.id })
          .getOne();
        if (foundAttendence === null)
          throw new NotFoundError();
        if (foundAttendence.version !== attendence.version)
          throw new InvalidVersionColumnError();
        foundAttendence.isAttend = attendence.isAttend;
        foundAttendence.commentOfTeacher = attendence.commentOfTeacher;
        await queryRunner.manager.upsert(UserAttendStudySession, foundAttendence, { conflictPaths: [], skipUpdateIfNoValuesChanged: true });
        await foundAttendence.reload();
        if (foundAttendence.version !== attendence.version + 1
          && foundAttendence.version !== attendence.version)
          throw new InvalidVersionColumnError();
      }
      for (let index = 0; index < makeups.length; index++) {
        const makeup = makeups[index];
        if (makeup.targetStudySession.id !== studySession.id)
          throw new ValidationError([]);
        const foundMakeUp = await queryRunner.manager
          .createQueryBuilder(MakeUpLession, "mul")
          .setLock("pessimistic_write")
          .useTransaction(true)
          .leftJoinAndSelect("mul.student", "student")
          .leftJoinAndSelect("student.user", "user")
          .leftJoinAndSelect("mul.targetStudySession", "targetStudySession")
          .where("targetStudySession.id = :studySessionId", { studySessionId: makeup.targetStudySession.id })
          .andWhere("user.id = :userId", { userId: makeup.student.user.id })
          .getOne();
        if (foundMakeUp === null)
          throw new NotFoundError();
        if (foundMakeUp.version !== makeup.version)
          throw new InvalidVersionColumnError();
        foundMakeUp.isAttend = makeup.isAttend;
        foundMakeUp.commentOfTeacher = makeup.commentOfTeacher;
        await queryRunner.manager.upsert(MakeUpLession, foundMakeUp, { conflictPaths: [], skipUpdateIfNoValuesChanged: true });
        await foundMakeUp.reload();
        if (foundMakeUp.version !== makeup.version + 1
          && foundMakeUp.version !== makeup.version)
          throw new InvalidVersionColumnError();
        const foundAttendence = await queryRunner.manager
          .createQueryBuilder(UserAttendStudySession, "a")
          .setLock("pessimistic_write")
          .useTransaction(true)
          .leftJoinAndSelect("a.studySession", "studySession")
          .leftJoinAndSelect("a.student", "student")
          .leftJoinAndSelect("student.user", "user")
          .where("studySession.id = :studySessionId", { studySessionId: makeup.studySession.id })
          .andWhere("user.id = :userId", { userId: makeup.student.user.id })
          .getOne();
        if (foundAttendence === null)
          throw new NotFoundError();
        foundAttendence.isAttend = makeup.isAttend;
        foundAttendence.commentOfTeacher = makeup.commentOfTeacher;
        await queryRunner.manager.upsert(UserAttendStudySession, foundAttendence, { conflictPaths: [], skipUpdateIfNoValuesChanged: true });
      }
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



  async getPersonalInformation(userId: number): Promise<UserTeacher> {
    if (userId === undefined)
      throw new NotFoundError();
    const userTeacher = await UserTeacherRepository.findUserTeacherByid(userId);
    if (userTeacher === null)
      throw new NotFoundError();
    return userTeacher;
  }


  async modifyPersonalInformation(userId: number, userTeacher: UserTeacher, avatarFile?: FileDto | null): Promise<CredentialDto | null> {
    const persistenceUserTeacher = await UserTeacherRepository.findUserTeacherByid(userId);
    if (persistenceUserTeacher === null) return null;
    const oldAvatarSrc = persistenceUserTeacher.worker.user.avatar;

    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect()
    await queryRunner.startTransaction()
    try {
      persistenceUserTeacher.worker.user.fullName = userTeacher.worker.user.fullName;
      persistenceUserTeacher.worker.user.dateOfBirth = moment(userTeacher.worker.user.dateOfBirth).toDate();
      persistenceUserTeacher.worker.user.sex = userTeacher.worker.user.sex;
      persistenceUserTeacher.worker.passport = userTeacher.worker.passport;
      persistenceUserTeacher.worker.nation = userTeacher.worker.nation;
      persistenceUserTeacher.worker.homeTown = userTeacher.worker.homeTown;
      persistenceUserTeacher.worker.user.address = userTeacher.worker.user.address;
      persistenceUserTeacher.worker.user.email = userTeacher.worker.user.email;
      persistenceUserTeacher.worker.user.phone = userTeacher.worker.user.phone;
      persistenceUserTeacher.shortDesc = userTeacher.shortDesc;
      persistenceUserTeacher.experience = userTeacher.experience;
      if (avatarFile && avatarFile.filename)
        persistenceUserTeacher.worker.user.avatar = AVATAR_DESTINATION_SRC + avatarFile.filename;
      let slug = slugify(persistenceUserTeacher.worker.user.fullName);
      const existedTeacherByFullName = await queryRunner.manager
        .createQueryBuilder(UserTeacher, "tt")
        .setLock("pessimistic_read")
        .useTransaction(true)
        .leftJoinAndSelect("tt.worker", "worker")
        .leftJoinAndSelect("worker.user", "user")
        .where("lower(user.fullName) = :fullName", { fullName: persistenceUserTeacher.worker.user.fullName })
        .andWhere("user.id <> :id", { id: userId })
        .getCount();
      if (existedTeacherByFullName > 0) slug = slug + "-" + existedTeacherByFullName;
      persistenceUserTeacher.slug = slug;

      if (persistenceUserTeacher.version !== userTeacher.version)
        throw new InvalidVersionColumnError();
      if (persistenceUserTeacher.worker.version !== userTeacher.worker.version)
        throw new InvalidVersionColumnError();
      if (persistenceUserTeacher.worker.user.version !== userTeacher.worker.user.version)
        throw new InvalidVersionColumnError();

      const userValidateErrors = await validate(persistenceUserTeacher.worker.user);
      if (userValidateErrors.length) throw new ValidationError(userValidateErrors);
      const workerValidateErrors = await validate(persistenceUserTeacher.worker);
      if (workerValidateErrors.length) throw new ValidationError(workerValidateErrors);
      const teacherValidateErrors = await validate(persistenceUserTeacher);
      if (teacherValidateErrors.length) throw new ValidationError(teacherValidateErrors);
      const savedUser = await queryRunner.manager.save(persistenceUserTeacher.worker.user);
      const savedWorker = await queryRunner.manager.save(persistenceUserTeacher.worker);
      await queryRunner.manager.upsert(UserTeacher, persistenceUserTeacher, { conflictPaths: [], skipUpdateIfNoValuesChanged: true });
      await persistenceUserTeacher.reload();

      if (persistenceUserTeacher.version !== userTeacher.version + 1
        && persistenceUserTeacher.version !== userTeacher.version)
        throw new InvalidVersionColumnError();
      if (savedWorker.version !== userTeacher.worker.version + 1
        && savedWorker.version !== userTeacher.worker.version)
        throw new InvalidVersionColumnError();
      if (savedUser.version !== userTeacher.worker.user.version + 1
        && savedUser.version !== userTeacher.worker.user.version)
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



  async getCurriculum(userId?: number, curriculumId?: number): Promise<Curriculum | null> {
    if (curriculumId === undefined) return null;
    if (userId === undefined) return null;
    return await CurriculumRepository.getCurriculumById(curriculumId);
  }



  async modifyCurriculum(userId?: number, curriculumDto?: CurriculumDto): Promise<Curriculum | null> {
    if (userId === undefined) return null;
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect()
    await queryRunner.startTransaction()

    try {
      if (curriculumDto == undefined || curriculumDto.curriculum.id == undefined)
        throw new NotFoundError();
      const foundCurriculum = await queryRunner.manager
        .createQueryBuilder(Curriculum, "curriculum")
        .setLock("pessimistic_write")
        .useTransaction(true)
        .leftJoinAndSelect("curriculum.lectures", "lectures")
        .leftJoinAndSelect("curriculum.tags", "tags")
        .where("curriculum.id = :curriculumId", { curriculumId: curriculumDto.curriculum.id })
        .andWhere("curriculum.latest = true")
        .getOne();

      if (foundCurriculum === null)
        throw new NotFoundError();
      if (curriculumDto.curriculum.version !== foundCurriculum?.version)
        throw new InvalidVersionColumnError();

      const newCurriculum = new Curriculum();
      newCurriculum.name = curriculumDto.curriculum.name;
      newCurriculum.desc = curriculumDto.curriculum.desc;
      newCurriculum.type = curriculumDto.curriculum.type;
      newCurriculum.shiftsPerSession = parseInt(curriculumDto.curriculum.shiftsPerSession as any);
      newCurriculum.level = curriculumDto.curriculum.level;
      newCurriculum.tags = await Promise.all(
        curriculumDto.curriculum.tags.map(async (tag: any) => {     // tag is string
          const foundTag = await queryRunner.manager
            .createQueryBuilder(Tag, "tag")
            .setLock("pessimistic_write")
            .useTransaction(true)
            .where(`tag.name = :name`, { name: tag })
            .getOne();
          if (foundTag) return foundTag;
          const tagEntity = new Tag();
          tagEntity.name = tag;
          tagEntity.type = TagsType.Curriculum;
          return await queryRunner.manager.save(tagEntity);
        })
      );
      newCurriculum.latest = true;
      if (curriculumDto.imageFile && curriculumDto.imageFile.filename) {
        newCurriculum.image = CURRICULUM_DESTINATION_SRC + curriculumDto.imageFile.filename;
      } else {
        const fileType = foundCurriculum.image.split('.').pop();
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        const imgName = "curriculum" + '-' + uniqueSuffix + "." + fileType;
        fs.copyFileSync(path.join(
          process.cwd(), "public", foundCurriculum.image),
          path.join(process.cwd(), "public", CURRICULUM_DESTINATION_SRC, imgName)
        );
        newCurriculum.image = path.join(CURRICULUM_DESTINATION_SRC, imgName);
      }
      foundCurriculum.latest = false;

      const oldCurriculumValidateErrors = await validate(foundCurriculum);
      if (oldCurriculumValidateErrors.length) throw new ValidationError(oldCurriculumValidateErrors);
      const newCurriculumValidateErrors = await validate(newCurriculum);
      if (newCurriculumValidateErrors.length) throw new ValidationError(newCurriculumValidateErrors);
      // Get list teachers who prefer the curiculum
      const prefers = await queryRunner.manager
        .createQueryBuilder(TeacherPreferCurriculum, "p")
        .setLock("pessimistic_write")
        .useTransaction(true)
        .leftJoinAndSelect("p.teacher", "teacher")
        .leftJoinAndSelect("p.curriculum", "curriculum")
        .getMany();
      // Delete modified curriculum if there is no course using it.
      const count = await queryRunner.manager
        .createQueryBuilder(Course, "course")
        .setLock("pessimistic_read")
        .useTransaction(true)
        .leftJoinAndSelect("course.curriculum", "curriculum")
        .where("curriculum.id = :curriculumId", { curriculumId: foundCurriculum.id })
        .getCount();

      if (count === 0) {
        if (foundCurriculum && foundCurriculum.image) {
          const filePath = path.join(process.cwd(), "public", foundCurriculum.image);
          fs.unlinkSync(filePath);
        }
        await queryRunner.manager.remove(foundCurriculum);
      } else {
        await queryRunner.manager.save(foundCurriculum);
      }

      const savedCurriculum = await queryRunner.manager.save(newCurriculum);
      if (savedCurriculum.id === null || savedCurriculum.id === undefined) throw new Error();
      for (const prefer of prefers) {
        const preferEntity = new TeacherPreferCurriculum();
        preferEntity.curriculum = savedCurriculum;
        preferEntity.teacher = prefer.teacher;
        await queryRunner.manager.save(preferEntity);
      }
      for (let index = 0; index < curriculumDto.curriculum.lectures.length; index++) {
        const lecture = curriculumDto.curriculum.lectures[index];
        const newLecture = new Lecture();
        newLecture.order = lecture.order;
        newLecture.name = lecture.name;
        newLecture.desc = lecture.desc;
        newLecture.detail = lecture.detail;
        newLecture.curriculum = savedCurriculum;

        const lectureValidateErrors = await validate(newLecture);
        if (lectureValidateErrors.length) throw new ValidationError(lectureValidateErrors);
        const savedLecture = await queryRunner.manager.save(newLecture);
        if (savedLecture.id === null || savedLecture.id === undefined) throw new Error();
      }
      await queryRunner.commitTransaction();
      await queryRunner.release();
      return savedCurriculum;
    } catch (error) {
      console.log(error);
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      return null;
    }
  }



  async createCurriculum(userId?: number, curriculumDto?: CurriculumDto): Promise<Curriculum | null> {
    if (userId === undefined) return null;

    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect()
    await queryRunner.startTransaction()

    try {
      if (curriculumDto == undefined)
        throw new NotFoundError();

      const newCurriculum = new Curriculum();
      newCurriculum.name = curriculumDto.curriculum.name;
      newCurriculum.desc = curriculumDto.curriculum.desc;
      newCurriculum.type = curriculumDto.curriculum.type;
      newCurriculum.shiftsPerSession = parseInt(curriculumDto.curriculum.shiftsPerSession as any);
      newCurriculum.level = curriculumDto.curriculum.level;
      newCurriculum.tags = await Promise.all(
        curriculumDto.curriculum.tags.map(async (tag: any) => {     // tag is string
          const foundTag = await queryRunner.manager
            .createQueryBuilder(Tag, "tag")
            .setLock("pessimistic_write")
            .useTransaction(true)
            .where(`tag.name = :name`, { name: tag })
            .getOne();
          if (foundTag) return foundTag;
          const tagEntity = new Tag();
          tagEntity.name = tag;
          tagEntity.type = TagsType.Curriculum;
          return await queryRunner.manager.save(tagEntity);
        })
      );
      newCurriculum.latest = true;
      if (curriculumDto.imageFile && curriculumDto.imageFile.filename) {
        newCurriculum.image = CURRICULUM_DESTINATION_SRC + curriculumDto.imageFile.filename;
      }
      const curriculumValidateErrors = await validate(newCurriculum);
      if (curriculumValidateErrors.length) throw new ValidationError(curriculumValidateErrors);

      const savedCurriculum = await queryRunner.manager.save(newCurriculum);
      if (savedCurriculum.id === null || savedCurriculum.id === undefined) throw new Error();
      for (let index = 0; index < curriculumDto.curriculum.lectures.length; index++) {
        const lecture = curriculumDto.curriculum.lectures[index];
        const newLecture = new Lecture();
        newLecture.order = lecture.order;
        newLecture.name = lecture.name;
        newLecture.desc = lecture.desc;
        newLecture.detail = lecture.detail;
        newLecture.curriculum = savedCurriculum;

        const lectureValidateErrors = await validate(newLecture);
        if (lectureValidateErrors.length) throw new ValidationError(lectureValidateErrors);
        const savedLecture = await queryRunner.manager.save(newLecture);
        if (savedLecture.id === null || savedLecture.id === undefined) throw new Error();
      }
      await queryRunner.commitTransaction();
      await queryRunner.release();
      return savedCurriculum;
    } catch (error) {
      console.log(error);
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      return null;
    }
  }




  async deleteCurriculum(curriculumId?: number): Promise<boolean> {
    if (curriculumId === undefined) return false;
    const curriculum = await CurriculumRepository.getCurriculumById(curriculumId);
    if (curriculum === null) return false;
    const count = await CourseRepository.countByCurriculumId(curriculumId);
    if (count === 0) {
      if (curriculum && curriculum.image) {
        const filePath = path.join(process.cwd(), "public", curriculum.image);
        fs.unlinkSync(filePath);
      }
      return await CurriculumRepository.deleteCurriculumById(curriculumId);
    } else {
      return await CurriculumRepository.setNullCurriculumById(curriculumId);
    }
  }

  //=========================================Hoc Exercise==============================================
  async createExercise(courseId: number, basicInfo: any, questions: any[]) : Promise<Exercise | null>{
    const course = await CourseRepository.findCourseById(courseId);
    if(course === null)
      throw new NotFoundError();

    if (course.closingDate !== null){
      throw new Error("Khóa học đã kết thúc, không thể thêm bài tập.");
    }
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      //Create Exercise
      const exercise = new Exercise();
      exercise.course = course!;
      exercise.name = basicInfo.nameExercise;
      exercise.maxTime = basicInfo.maxTime;
      exercise.questions = [];
      
      const dateDoExercise: Date[] = [new Date(basicInfo.dateDoExercise[0]), new Date(basicInfo.dateDoExercise[1])];
      const timeDoExercise: Date[] = [new Date(basicInfo.timeDoExercise[0]), new Date(basicInfo.timeDoExercise[1])];
      console.log(dateDoExercise)
      exercise.openTime = new Date(
        dateDoExercise[0].getFullYear(),
        dateDoExercise[0].getMonth(),
        dateDoExercise[0].getDate(),
        timeDoExercise[0].getHours(),
        timeDoExercise[0].getMinutes(),
        timeDoExercise[0].getSeconds(),
      );
      exercise.endTime = new Date(
        dateDoExercise[1].getFullYear(),
        dateDoExercise[1].getMonth(),
        dateDoExercise[1].getDate(),
        timeDoExercise[1].getHours(),
        timeDoExercise[1].getMinutes(),
        timeDoExercise[1].getSeconds(),
      );

      //Create Question
      for (const question of questions) {
        const questionEntity = new Question();
        questionEntity.quesContent = question.quesContent;
        questionEntity.audioSrc = question.audioSrc;
        questionEntity.imgSrc = question.imgSrc;
        questionEntity.answer = question.rightAnswer;
        questionEntity.tags = [];
        //TODO: add tags
        if (question.tags !== null) {
          for (const tag of question.tags) {
            const findedTag = await Tag.find({
              where: {
                name: tag,
                type: TagsType.Question,
              }
            });
            if (findedTag.length === 0) continue;
            questionEntity.tags.push(findedTag[0])
          }
        }

        const savedQuestion = await queryRunner.manager.save(questionEntity);
        if (savedQuestion.id === null || savedQuestion.id === undefined) throw new Error();

        if (question.wrongAnswer1 !== '') {
          const wrongAnswer = new WrongAnswer();
          wrongAnswer.answer = question.wrongAnswer1;
          wrongAnswer.question = savedQuestion;

          const savedWrongAnswer = await queryRunner.manager.save(wrongAnswer);
          if (savedWrongAnswer.id === null || savedWrongAnswer.id === undefined) throw new Error();
        }
        if (question.wrongAnswer2 !== '') {
          const wrongAnswer = new WrongAnswer();
          wrongAnswer.answer = question.wrongAnswer2;
          wrongAnswer.question = savedQuestion;

          const savedWrongAnswer = await queryRunner.manager.save(wrongAnswer);
          if (savedWrongAnswer.id === null || savedWrongAnswer.id === undefined) throw new Error();
        }
        if (question.wrongAnswer3 !== '') {
          const wrongAnswer = new WrongAnswer();
          wrongAnswer.answer = question.wrongAnswer3;
          wrongAnswer.question = savedQuestion;

          const savedWrongAnswer = await queryRunner.manager.save(wrongAnswer);
          if (savedWrongAnswer.id === null || savedWrongAnswer.id === undefined) throw new Error();
        }

        exercise.questions.push(savedQuestion);
      }

      const savedExercise = await queryRunner.manager.save(exercise);
      if (savedExercise.id === null || savedExercise.id === undefined) throw new Error();

      await queryRunner.commitTransaction();
      return savedExercise;
    } catch (error) {
      console.log(error);
      await queryRunner.rollbackTransaction();
      return null;
    }finally {
      await queryRunner.release();
    }
  }

  async modifyExercise(exerciseId: number, basicInfo: any, questions: any[], deleteQuestions: any[]) : Promise<Exercise | null>{
    const exercise = await Exercise.createQueryBuilder("exercise")
                                 .leftJoinAndSelect("exercise.questions", "questions")
                                 .leftJoinAndSelect("questions.wrongAnswers", "wrongAnswers")
                                 .leftJoinAndSelect("questions.tags", "tags")
                                 .leftJoinAndSelect("exercise.course", "course")
                                 .where("exercise.id = :exerciseId", {exerciseId: exerciseId})
                                 .getOne();
    if(exercise === null)
      throw new NotFoundError();
    // TODO:Commented for testing
    // if (exercise.course.closingDate !== null){
    //   throw new Error("Khóa học đã kết thúc, không thể chỉnh sửa bài tập.");
    // }
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try{
      exercise.name = basicInfo.nameExercise;
      exercise.maxTime = basicInfo.maxTime;

      const dateDoExercise: Date[] = [new Date(basicInfo.dateDoExercise[0]), new Date(basicInfo.dateDoExercise[1])];
      const timeDoExercise: Date[] = [new Date(basicInfo.timeDoExercise[0]), new Date(basicInfo.timeDoExercise[1])];

      exercise.openTime = new Date(
        dateDoExercise[0].getFullYear(), 
        dateDoExercise[0].getMonth(), 
        dateDoExercise[0].getDate(),
        timeDoExercise[0].getHours(),
        timeDoExercise[0].getMinutes(),
        timeDoExercise[0].getSeconds(),
      );
      exercise.endTime = new Date(
        dateDoExercise[1].getFullYear(), 
        dateDoExercise[1].getMonth(), 
        dateDoExercise[1].getDate(),
        timeDoExercise[1].getHours(),
        timeDoExercise[1].getMinutes(),
        timeDoExercise[1].getSeconds(),
      );

      if (exercise.questions === null)
        exercise.questions = [];

      const modifyQuestions = [];
      
      deleteQuestions.forEach(async (id: number) => {
        await queryRunner.manager.delete(Question, id);
      })

      //Add new Question
      for(const question of questions){
        let questionEntity = new Question();
        //New questions have key field.
        if(!question.key){
          const foundQuestion = await queryRunner.manager.findOne(Question, {
            where: {
              id: question.id,
            },
            relations: ["tags", "wrongAnswers"],
          })
          if (foundQuestion === null){
            throw new NotFoundError();
          }

          questionEntity = foundQuestion;
          //Delete wrongAnswer
          questionEntity.wrongAnswers.forEach(async (wrongAnswer: WrongAnswer) => {
            await queryRunner.manager.delete(WrongAnswer, wrongAnswer.id);
          })
        }else {
          console.log("--------------------------------------------")
          questionEntity.wrongAnswers = [];
        }
        questionEntity.quesContent = question.quesContent;
        questionEntity.audioSrc = question.audioSrc;
        questionEntity.imgSrc = question.imgSrc;
        questionEntity.answer = question.rightAnswer;
        questionEntity.tags = [];
        
        //Add tags
        if(question.tags !== null) {
          for(const tag of question.tags){
            const findedTag = await Tag.find({
              where: {
                name: tag,
                type: TagsType.Question,
              }
            });
            if (findedTag.length === 0) continue;
            questionEntity.tags.push(findedTag[0])
          }
        }

        const savedQuestion = await queryRunner.manager.save(questionEntity);
        if(savedQuestion.id === null || savedQuestion.id === undefined) throw new Error();
        
        if(question.wrongAnswer1 !== ''){
          const wrongAnswer = new WrongAnswer();
          wrongAnswer.answer = question.wrongAnswer1;
          wrongAnswer.question = savedQuestion;

          const savedWrongAnswer = await queryRunner.manager.save(wrongAnswer);
          if(savedWrongAnswer.id === null || savedWrongAnswer.id === undefined) throw new Error();

          const responseWrongAnswer = new WrongAnswer();
          responseWrongAnswer.answer = savedWrongAnswer.answer;
          savedQuestion.wrongAnswers.push(responseWrongAnswer);
        }
        if(question.wrongAnswer2 !== ''){
          const wrongAnswer = new WrongAnswer();
          wrongAnswer.answer = question.wrongAnswer2;
          wrongAnswer.question = savedQuestion;

          const savedWrongAnswer = await queryRunner.manager.save(wrongAnswer);
          if(savedWrongAnswer.id === null || savedWrongAnswer.id === undefined) throw new Error();

          const responseWrongAnswer = new WrongAnswer();
          responseWrongAnswer.answer = savedWrongAnswer.answer;
          savedQuestion.wrongAnswers.push(responseWrongAnswer);
        }
        if(question.wrongAnswer3 !== ''){
          const wrongAnswer = new WrongAnswer();
          wrongAnswer.answer = question.wrongAnswer3;
          wrongAnswer.question = savedQuestion;
          
          const savedWrongAnswer = await queryRunner.manager.save(wrongAnswer);
          if(savedWrongAnswer.id === null || savedWrongAnswer.id === undefined) throw new Error();

          const responseWrongAnswer = new WrongAnswer();
          responseWrongAnswer.answer = savedWrongAnswer.answer;
          savedQuestion.wrongAnswers.push(responseWrongAnswer);
        }
        modifyQuestions.push(savedQuestion);
      }
      exercise.questions = modifyQuestions;
      const savedExercise = await queryRunner.manager.save(exercise);
        if(savedExercise.id === null || savedExercise.id === undefined) throw new Error();
      await queryRunner.commitTransaction();
      return savedExercise;
    }catch (error) {
      console.log(error);
      await queryRunner.rollbackTransaction();
      return null;
    }finally {
      await queryRunner.release();
    }
  }

  async addNewQuestionTag(tagName: string): Promise<Tag | null> {
    try {
      const isOld = await Tag.find({
        where: {
          name: tagName,
        }
      });
      if (isOld.length > 0) throw new DuplicateError();
      const newTag = new Tag();
      newTag.name = tagName;
      newTag.type = TagsType.Question;
      const savedTag = await Tag.save(newTag);
      return savedTag;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async getAllQuestionTags(): Promise<Tag[]> {
    const tag = Tag.find({
      where: {
        type: TagsType.Question,
      }
    });
    return tag;
  }

  async getExerciseById(exerciseId: number) : Promise<Exercise | null>{
    try{
      const exercise = await Exercise.createQueryBuilder("exercise")
                               .leftJoinAndSelect("exercise.questions", "questions")
                               .leftJoinAndSelect("questions.wrongAnswers", "wrongAnswers")
                               .leftJoinAndSelect("questions.tags", "tags")
                               .where("exercise.id = :exerciseId", {exerciseId})
                               .getOne();
      
      if(exercise === null){
        throw new Error("Không tìm thấy bài tập.");
      }
      return exercise;
    }catch(error){
      console.log(error);
      return null;
    }
  }

 async getStdExeResult(exerciseId: number) : Promise<StudentDoExercise[] | null>{
    try{
      const exercise = await Exercise.createQueryBuilder("exercise")
                              .where("exercise.id = :exerciseId", {exerciseId})
                              .getOne();
      
      if(exercise === null){
        throw new Error("Không tìm thấy bài tập.");
      }

      const stdExeResult = await StudentDoExercise.createQueryBuilder("studentDoExercise")
                                                  .leftJoin(
                                                    qb =>
                                                      qb.from(StudentDoExercise, "inner")
                                                        .select("max(score)", "maxScore")
                                                        .addSelect('studentId')
                                                        .addSelect("exerciseId")
                                                        .groupBy('studentId, exerciseId'),
                                                    'maxScoreTable',
                                                    'maxScoreTable.studentId = studentDoExercise.studentId AND maxScoreTable.exerciseId = studentDoExercise.exerciseId'
                                                  )
                                                  .leftJoinAndSelect("studentDoExercise.exercise", "exercise")
                                                  .leftJoinAndSelect("studentDoExercise.student", "student")
                                                  .leftJoinAndSelect("student.user", "user")
                                                  .where("studentDoExercise.score = maxScore")
                                                  .andWhere("exercise.id = :exerciseId", {exerciseId})
                                                  .getMany();
      return stdExeResult;
    }catch(error){
      console.log(error);
      return null;
    }
  }

  //=====================================END HOC=============================================================


  async getPreferedCurriculums(userId?: number): Promise<Curriculum[]> {
    if (userId === undefined) return [];
    const teacher = await UserTeacherRepository.findPreferedCurriculums(userId);
    if (teacher === null) return [];
    return teacher.preferredCurriculums.map(prefer => prefer.curriculum);
  }


  async getCheckPreferredCurriculum(userId?: number, curriculumId?: number): Promise<boolean> {
    if (userId === undefined || curriculumId === undefined) return false;
    return UserTeacherRepository.checkPreferredCurriculum(userId, curriculumId);
  }


  async addPreferredCurriculum(userId?: number, curriculumId?: number): Promise<boolean> {
    if (userId === undefined || curriculumId === undefined) return false;
    const teacher = await UserTeacherRepository.findPreferedCurriculums(userId);
    if (teacher === null) return false;
    const curriculum = await CurriculumRepository.getCurriculumById(curriculumId);
    if (curriculum === null) return false;

    const prefer = new TeacherPreferCurriculum();
    prefer.curriculum = curriculum;
    prefer.teacher = teacher;
    await prefer.save();
    return true;
  }


  async removePreferredCurriculum(userId?: number, curriculumId?: number): Promise<boolean> {
    if (userId === undefined || curriculumId === undefined) return false;
    const teacher = await UserTeacherRepository.findPreferedCurriculums(userId);
    if (teacher === null) return false;
    return await TeacherPreferCurriculumRepository.deletePreferCurriculum(userId, curriculumId);
  }


  async closeCourse(userId?: number, courseSlug?: string): Promise<Course | null> {
    if (userId === undefined || courseSlug === undefined) return null;
    const course = await CourseRepository.findCourseBySlug(courseSlug);
    if (course === null) return null;
    if (course.teacher.worker.user.id !== userId) return null;
    if (course.closingDate !== null) return null;
    if (moment().diff(moment(course.expectedClosingDate)) < 0) return null;
    course.closingDate = new Date();
    const savedCourse = await course.save();
    return savedCourse;
  }


  async getSchedule(pageableDto: PageableDto, userId?: number, startDate?: Date, endDate?: Date): Promise<{ total: number, studySessions: StudySession[] }> {
    const result = { total: 0, studySessions: [] as StudySession[] }
    if (userId === undefined || startDate === undefined || endDate === undefined) return result;
    const pageable = new Pageable(pageableDto);
    result.studySessions = await StudySessionRepository.findStudySessionsByTeacherId(userId, startDate, endDate, pageable);
    result.total = await StudySessionRepository.countStudySessionsByTeacherId(userId, startDate, endDate);
    return result;
  }


  async getEmployeeByBranch(userId?: number, branchId?: number): Promise<UserEmployee[]> {
    if (userId === undefined || branchId === undefined) return [];
    return await EmployeeRepository.findUserEmployeeByBranch(branchId);
  }


  async getCurriculumTags(userId: number): Promise<Tag[]> {
    if (userId === undefined) return [];
    return await TagRepository.getCurriculumTags();
  }
}

const TeacherService = new TeacherServiceImpl();
export default TeacherService;