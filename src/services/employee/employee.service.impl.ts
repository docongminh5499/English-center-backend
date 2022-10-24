import { faker } from "@faker-js/faker";
import { CourseDetailDto, CourseListDto, CreateCourseDto, PageableDto } from "../../dto";
import { Branch } from "../../entities/Branch";
import { Classroom } from "../../entities/Classroom";
import { Course } from "../../entities/Course";
import { Curriculum } from "../../entities/Curriculum";
import { Shift } from "../../entities/Shift";
import { StudySession } from "../../entities/StudySession";
import { UserEmployee } from "../../entities/UserEmployee";
import { UserTeacher } from "../../entities/UserTeacher";
import { UserTutor } from "../../entities/UserTutor";
import { CourseRepository, Pageable, Selectable, Sortable } from "../../repositories";
import BranchRepository from "../../repositories/branch/branch.repository.impl";
import ClassroomRepository from "../../repositories/classroom/classroom.repository.impl";
import CurriculumRepository from "../../repositories/curriculum/curriculum.repository.impl";
import ShiftRepository from "../../repositories/shift/shift.repository.impl";
import StudySessionRepository from "../../repositories/studySession/studySession.repository.impl";
import EmployeeRepository from "../../repositories/userEmployee/employee.repository.impl";
import UserTeacherRepository from "../../repositories/userTeacher/userTeachere.repository.impl";
import TutorRepository from "../../repositories/userTutor/tutor.repository.impl";
import Queryable from "../../utils/common/queryable.interface";
import { COURSE_DESTINATION_SRC } from "../../utils/constants/course.constant";
import { cvtWeekDay2Num } from "../../utils/constants/weekday.constant";
import { NotFoundError } from "../../utils/errors/notFound.error";
import { ValidationError } from "../../utils/errors/validation.error";
import { AppDataSource } from "../../utils/functions/dataSource";
import { slugify } from "../../utils/functions/slugify";
import EmployeeServiceInterface from "./employee.service.interface";

class EmployeeServiceImpl implements EmployeeServiceInterface {
  async getPersonalInformation(userId: number): Promise<UserEmployee> {
    if (userId === undefined)
      throw new NotFoundError();
    const userEmployee = await EmployeeRepository.findUserEmployeeByid(userId);
    if (userEmployee === null)
      throw new NotFoundError();
    return userEmployee;
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


  async getTeacherFreeShifts(userId?: number, teacherId?: number, beginingDate?: Date): Promise<Shift[]> {
    if (userId === undefined || teacherId === undefined ||
      beginingDate === undefined || beginingDate === null) return [];
    return await ShiftRepository.findAvailableShiftsOfTeacher(teacherId, beginingDate);
  }


  async getAvailableTutors(userId?: number, beginingDate?: Date, shiftIds?: number[], branchId?: number): Promise<UserTutor[]> {
    if (userId === undefined || shiftIds === undefined || beginingDate === undefined || beginingDate === null) return [];
    return await TutorRepository.findTutorsAvailable(beginingDate, shiftIds, branchId);
  }


  async getAvailableClassroom(userId?: number, beginingDate?: Date, shiftIds?: number[], branchId?: number): Promise<Classroom[]> {
    if (userId === undefined || shiftIds === undefined ||
      beginingDate === undefined || beginingDate === null || branchId === undefined) return [];
    return await ClassroomRepository.findClassroomAvailable(branchId, beginingDate, shiftIds);
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
      .add("slug", "slug");
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
    return courseDetail;
  }



  async getStudySessions(employeeId: number, courseSlug: string,
    pageableDto: PageableDto): Promise<{ total: number, studySessions: StudySession[] }> {

    if (employeeId === undefined) return { total: 0, studySessions: [] };
    const employee = await EmployeeRepository.findUserEmployeeByid(employeeId);
    if (employee === null) throw new NotFoundError();

    const course = await CourseRepository.findCourseBySlug(courseSlug);
    if (course?.branch.id !== employee.worker.branch.id) return { total: 0, studySessions: [] };
    const pageable = new Pageable(pageableDto);
    const result = await StudySessionRepository.findStudySessionsByCourseSlug(courseSlug, pageable);
    const total = await StudySessionRepository.countStudySessionsByCourseSlug(courseSlug);

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
      const teachers = await UserTeacherRepository
        .findUserTeacherByBranchAndPreferedCurriculum(createCourseDto.branch, createCourseDto.curriculum);
      const foundTeacher = teachers.find(teacher => teacher.worker.user.id === createCourseDto.teacher);
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
        else choseSchedule.choseClassroom.push(foundClassroom);
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
      const existedCourseBySlug = await queryRunner.manager.countBy(Course, { slug });
      if (existedCourseBySlug > 0) slug = slug + "-" + existedCourseBySlug;

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

        if (firstDay >= course.openingDate) {
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
        studySession.isTeacherAbsent = false;
        studySession.notes = faker.lorem.paragraphs();
        studySession.course = course;
        studySession.shifts = choseSchedule.choseShifts[sheduleIndex];
        studySession.tutor = choseSchedule.choseTutor[sheduleIndex];
        studySession.teacher = choseSchedule.choseTeacher;
        studySession.classroom = choseSchedule.choseClassroom[sheduleIndex];
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
      savedCourse = await queryRunner.manager.save(savedCourse);
      await queryRunner.commitTransaction();
      await queryRunner.release();
      return savedCourse;
    } catch (error) {
      console.log(error);
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      return null;
    }
  }
}


export const EmployeeService = new EmployeeServiceImpl();