import { validate } from "class-validator";
import { UserDto, PageableDto, NotificationListDto, NotificationDto, NotificationResponseDto, CourseNotificationDto } from "../../dto";
import { Notification } from "../../entities/Notification";
import { CourseRepository, Pageable, Sortable, UserRepository } from "../../repositories";
import NotificationRepository from "../../repositories/notification/notification.repository.impl";
import { NotEnoughPermissionError } from "../../utils/errors/notEnoughPermission.error";
import { NotFoundError } from "../../utils/errors/notFound.error";
import { SystemError } from "../../utils/errors/system.error";
import { ValidationError } from "../../utils/errors/validation.error";
import { AppDataSource } from "../../utils/functions/dataSource";
import NotificationServiceInterface from "./notification.service.interface";

class NotificationServiceImpl implements NotificationServiceInterface {
  async getNotification(user: UserDto, pageableDto: PageableDto): Promise<NotificationListDto> {
    if (user.id === undefined)
      throw new NotFoundError();

    const foundUser = await UserRepository.findUserByid(user.id);
    if (foundUser == null)
      throw new NotFoundError();

    const sortable = new Sortable().add("notification.createdAt", "DESC");
    const pageable = new Pageable(pageableDto);
    const [notifications, notificationCount] = await Promise.all([
      NotificationRepository.getNotification(foundUser, pageable, sortable),
      NotificationRepository.getNotificationCount(foundUser)
    ]);

    const notificationList = new NotificationListDto();
    notificationList.notifications = notifications.map(notification => ({
      id: notification.id,
      content: notification.content,
      read: notification.read,
      userId: foundUser.id,
      createdAt: notification.createdAt,
    }));
    notificationList.limit = pageable.limit;
    notificationList.skip = pageable.offset;
    notificationList.total = notificationCount;

    return notificationList;
  }


  async sendNotification(notificationDto: NotificationDto): Promise<NotificationResponseDto> {
    if (notificationDto.userId === undefined)
      throw new NotFoundError();
    if (notificationDto.content === undefined)
      throw new ValidationError([]);

    const foundUser = await UserRepository.findUserByid(notificationDto.userId);
    if (foundUser == null) throw new NotFoundError();

    const response = new NotificationResponseDto();
    const savedNotification = await NotificationRepository.saveNotification(foundUser, notificationDto.content);
    response.success = savedNotification !== null;
    response.receiverSocketStatuses = foundUser.socketStatuses;
    if (savedNotification !== null) {
      response.notification = {
        id: savedNotification.id,
        content: savedNotification.content,
        read: savedNotification.read,
        userId: savedNotification.user.id,
        createdAt: savedNotification.createdAt
      };
    }
    return response;
  }


  async readNotification(notificationDto: NotificationDto): Promise<NotificationResponseDto> {
    if (notificationDto.userId === undefined || notificationDto.id === undefined)
      throw new NotFoundError();
    const foundUser = await UserRepository.findUserByid(notificationDto.userId);
    if (foundUser == null) throw new NotFoundError();

    const response = new NotificationResponseDto();
    const updated = await NotificationRepository.readNotification(notificationDto.id);
    response.success = updated;
    response.receiverSocketStatuses = foundUser.socketStatuses;
    response.notification = {
      id: notificationDto.id,
    };
    return response;
  }



  async getUnreadNotificationCount(user: UserDto): Promise<number> {
    if (user.id === undefined)
      throw new NotFoundError();
    const userEntity = await UserRepository.findUserByid(user.id);
    if (userEntity === null)
      throw new NotFoundError();
    return NotificationRepository.getUnreadNotificationCount(userEntity);
  }


  async sendCourseNotification(courseNotificationDto: CourseNotificationDto): Promise<NotificationResponseDto[]> {
    if (courseNotificationDto.teacherId === undefined)
      throw new NotFoundError();
    if (courseNotificationDto.courseId === undefined)
      throw new NotFoundError();
    if (courseNotificationDto.content === undefined)
      throw new ValidationError([]);

    const course = await CourseRepository.findCourseById(courseNotificationDto.courseId);
    if (course == null)
      throw new NotFoundError();
    if (course.teacher.worker.user.id !== courseNotificationDto.teacherId)
      throw new NotEnoughPermissionError();

    let response: NotificationResponseDto[] = [];
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect()
    await queryRunner.startTransaction()

    try {
      for (let index = 0; index < course.studentPaticipateCourses.length; index++) {
        const notificationRepsonse = new NotificationResponseDto();
        const studentUser = course.studentPaticipateCourses[index].student.user;

        const notification = new Notification();
        notification.read = false;
        notification.content = courseNotificationDto.content;
        notification.user = studentUser;

        const validateErrors = await validate(notification);
        if (validateErrors.length) throw new ValidationError(validateErrors);
        const savedNotification = await queryRunner.manager.save(notification);
        if (savedNotification.id === undefined) throw new SystemError();

        notificationRepsonse.success = true;
        notificationRepsonse.notification = savedNotification;
        notificationRepsonse.receiverSocketStatuses = studentUser.socketStatuses;
        response.push(notificationRepsonse);
      }
      await queryRunner.commitTransaction();
    } catch (error) {
      console.log(error);
      response = [];
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
      return response;
    }
  }
}

const NotificationService = new NotificationServiceImpl();
export default NotificationService;