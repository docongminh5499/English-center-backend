import moment = require("moment");
import { UserDto, PageableDto, NotificationListDto, NotificationDto, NotificationResponseDto } from "../../dto";
import { Pageable, Sortable, UserRepository } from "../../repositories";
import NotificationRepository from "../../repositories/notification/notification.repository.impl";
import { NotFoundError } from "../../utils/errors/notFound.error";
import { ValidationError } from "../../utils/errors/validation.error";
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
        createdAt: moment(savedNotification.createdAt).utc().toDate()
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

}

const NotificationService = new NotificationServiceImpl();
export default NotificationService;