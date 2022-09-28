import { NotificationDto, NotificationListDto, NotificationResponseDto, PageableDto, UserDto } from "../../dto";

export default interface NotificationService {
    getNotification: (user: UserDto, pageableDto: PageableDto) => Promise<NotificationListDto>;

    sendNotification: (notificationDto: NotificationDto) => Promise<NotificationResponseDto>;

    readNotification: (notificationDto: NotificationDto) => Promise<NotificationResponseDto>;

    getUnreadNotificationCount: (user: UserDto) => Promise<number>;
}