import { SocketStatus } from "../../entities/SocketStatus";
import NotificationDto from "./notification.dto";

export default class NotificationResponseDto {
    notification: NotificationDto;
    receiverSocketStatuses: SocketStatus[];
    success: boolean;
}