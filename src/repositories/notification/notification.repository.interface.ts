import { Notification } from "../../entities/Notification";
import { User } from "../../entities/UserEntity";
import Pageable from "../helpers/pageable";
import Sortable from "../helpers/sortable";

export default interface NotificationRepository {
    getNotificationCount: (user: User) => Promise<number>;

    getNotification: (user: User, pageable: Pageable, sortable: Sortable) => Promise<Notification[]>;

    saveNotification: (user: User, content: string) => Promise<Notification | null>;

    readNotification: (notificationId: number) => Promise<boolean>;

    getUnreadNotificationCount: (user: User) => Promise<number>;
}