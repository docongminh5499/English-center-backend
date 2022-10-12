import { PageableDto, CourseListDto, DocumentDto, CourseDetailDto, FileDto, CredentialDto } from "../../dto";
import { Course } from "../../entities/Course";
import { AccountRepository, CourseRepository, Pageable, Selectable, Sortable } from "../../repositories";
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
import moment = require("moment");
import { AVATAR_DESTINATION_SRC } from "../../utils/constants/avatar.constant";
import * as path from "path";
import * as fs from "fs";
import * as jwt from "jsonwebtoken";
import { AppDataSource } from "../../utils/functions/dataSource";
import { InvalidVersionColumnError } from "../../utils/errors/invalidVersionColumn.error";
import { Curriculum } from "../../entities/Curriculum";
import { AccountRole } from "../../utils/constants/role.constant";
import CurriculumRepository from "../../repositories/curriculum/curriculum.repository.impl";
import CurriculumDto from "../../dto/requests/curriculum.dto";
import { CURRICULUM_DESTINATION_SRC } from "../../utils/constants/curriculum.constant";
import { Lecture } from "../../entities/Lecture";

class TeacherServiceImpl implements TeacherServiceInterface {
  async getCoursesByTeacher(teacherId: number, pageableDto: PageableDto, queryable: Queryable<Course>): Promise<CourseListDto> {
    const selectable = new Selectable()
      .add("Course.id", "id")
      .add("Course.image", "image")
      .add("closingDate", "closingDate")
      .add("Course.name", "name")
      .add("openingDate", "openingDate")
      .add("slug", "slug");
    const sortable = new Sortable()
      .add("openingDate", "DESC")
      .add("name", "ASC");
    const pageable = new Pageable(pageableDto);

    const [courseCount, courseList] = await Promise.all([
      CourseRepository.countCourseByTeacher(queryable, teacherId),
      CourseRepository.findCourseByTeacher(pageable, sortable, selectable, queryable, teacherId)
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
    if (course?.teacher.worker.user.id !== teacherId)
      return null;
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
    courseDetail.studentPaticipateCourses = course.studentPaticipateCourses.map(participation => ({
      student: participation.student,
      course: participation.course,
      billingDate: participation.billingDate,
    }));
    courseDetail.maskedComments = course.studentPaticipateCourses
      .filter(participation =>
        participation.starPoint !== null &&
        participation.starPoint !== undefined)
      .map(participation => ({
        comment: participation.comment,
        starPoint: participation.starPoint,
        userFullName: participation.isIncognito ? "Người dùng đã ẩn danh" : participation.student.user.fullName,
        commentDate: participation.commentDate
      }));
    return courseDetail;
  }


  async deleteExercise(teacherId: number, exerciseId: number): Promise<boolean> {
    // const exercise = await ExerciseRepository.findExerciseById(exerciseId);
    // if (exercise)
    const result = await ExerciseRepository.deleteExercise(exerciseId);
    return result;
  }


  async deleteDocument(teacherId: number, documentId: number): Promise<boolean> {
    const result = await DocumentRepository.deleteDocument(documentId);
    return result;
  }

  async createDocument(documentDto: DocumentDto): Promise<Document | null> {
    if (documentDto.courseSlug === undefined)
      throw new ValidationError([]);
    const course = await CourseRepository.findCourseBySlug(documentDto.courseSlug);
    if (course === null)
      throw new ValidationError([]);

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

    persistenceUserTeacher.worker.user.fullName = userTeacher.worker.user.fullName;
    persistenceUserTeacher.worker.user.dateOfBirth = moment(userTeacher.worker.user.dateOfBirth).utc().toDate();
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


    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect()
    await queryRunner.startTransaction()
    try {
      if (persistenceUserTeacher.version !== userTeacher.version)
        throw new InvalidVersionColumnError();
      if (persistenceUserTeacher.worker.version !== userTeacher.worker.version)
        throw new InvalidVersionColumnError();
      if (persistenceUserTeacher.worker.user.version !== userTeacher.worker.user.version)
        throw new InvalidVersionColumnError();

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

    const account = await AccountRepository.findByUserId(userId);
    if (account === null) return [];
    if (account.role !== AccountRole.TEACHER) return [];
    return await CurriculumRepository.getCurriculumList();
  }



  async getCurriculum(userId?: number, curriculumId?: number): Promise<Curriculum | null> {
    if (curriculumId === undefined) return null;
    if (userId === undefined) return null;

    const account = await AccountRepository.findByUserId(userId);
    if (account === null) return null;
    if (account.role !== AccountRole.TEACHER) return null;
    return await CurriculumRepository.getCurriculumById(curriculumId);
  }



  async modifyCurriculum(userId?: number, curriculumDto?: CurriculumDto): Promise<Curriculum | null> {
    if (userId === undefined) return null;

    const account = await AccountRepository.findByUserId(userId);
    if (account === null) return null;
    if (account.role !== AccountRole.TEACHER) return null;

    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect()
    await queryRunner.startTransaction()

    try {
      if (curriculumDto == undefined || curriculumDto.curriculum.id == undefined)
        throw new NotFoundError();
      const foundCurriculum = await CurriculumRepository.getCurriculumById(curriculumDto.curriculum.id);
      if (foundCurriculum === null)
        throw new NotFoundError();
      if (curriculumDto.curriculum.version !== foundCurriculum?.version)
        throw new InvalidVersionColumnError();

      const newCurriculum = new Curriculum();
      newCurriculum.name = curriculumDto.curriculum.name;
      newCurriculum.desc = curriculumDto.curriculum.desc;
      newCurriculum.type = curriculumDto.curriculum.type;
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

      await queryRunner.manager.save(foundCurriculum);
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

    const account = await AccountRepository.findByUserId(userId);
    if (account === null) return null;
    if (account.role !== AccountRole.TEACHER) return null;

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
      newCurriculum.latest = true;
      if (curriculumDto.imageFile && curriculumDto.imageFile.filename) {
        newCurriculum.image = CURRICULUM_DESTINATION_SRC + curriculumDto.imageFile.filename;
      }
      
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
}

const TeacherService = new TeacherServiceImpl();
export default TeacherService;