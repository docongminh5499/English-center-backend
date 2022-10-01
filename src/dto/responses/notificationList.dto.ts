import NotificationDto from "./notification.dto";


export default class NotificationListDto {
    notifications: NotificationDto[];
    total: number;
    limit: number;
    skip: number;
}