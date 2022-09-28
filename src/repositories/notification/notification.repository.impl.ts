import { Notification } from "../../entities/Notification";
import { User } from "../../entities/UserEntity";
import Pageable from "../helpers/pageable";
import Sortable from "../helpers/sortable";
import NotificationRepositoryInterface from "./notification.repository.interface";

class NotificationRepositoryImpl implements NotificationRepositoryInterface {

  async getNotificationCount(user: User): Promise<number> {
    let query = Notification.createQueryBuilder('notification')
      .where('notification.userId = :userId', { userId: user.id })
    return (await query.getCount());
  }


  async getNotification(user: User, pageable: Pageable, sortable: Sortable): Promise<Notification[]> {
    let query = Notification.createQueryBuilder('notification')
      .leftJoinAndSelect("notification.user", "user")
      .where('notification.userId = :userId', { userId: user.id });
    query = pageable.buildQuery(query);
    query = sortable.buildQuery(query);
    return (await query.getMany());
  }


  async saveNotification(user: User, content: string): Promise<Notification | null> {
    const notification = new Notification();
    notification.content = content;
    notification.user = user;

    const savedNotification = await notification.save();
    if (savedNotification.id === undefined) return null;
    return savedNotification;
  }


  async readNotification(notificationId: number): Promise<boolean> {
    const result = await Notification.createQueryBuilder()
      .update()
      .set({ read: true })
      .where("id = :id", {
        id: notificationId
      }).execute();

    return result.affected !== undefined
      && result.affected !== null
      && result.affected > 0;
  }


  async getUnreadNotificationCount(user: User): Promise<number> {
    const result = await Notification.createQueryBuilder("notification")
      .where("notification.userId = :userId", { userId: user.id })
      .andWhere("notification.read = 0")
      .getCount();
    return result;
  }
}

const NotificationRepository = new NotificationRepositoryImpl();
export default NotificationRepository;