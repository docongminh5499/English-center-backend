import { Server } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { NotificationService } from "../../services/notification";
import { NotificationMapper } from "./mappers";
import * as jwt from "jsonwebtoken";
import { CourseNotificationDto } from "../../dto";

export default function addNotificationEventHandler(io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>) {
  io.on("connection", (socket) => {
    socket.on("notification", async (json) => {
      try {
        jwt.verify(json.token, process.env.TOKEN_KEY || "");

        const notificationDto = NotificationMapper.mapToDto(json);
        const result = await NotificationService.sendNotification(notificationDto);
        if (result.success) {
          if (result.receiverSocketStatuses && result.receiverSocketStatuses.length) {
            result.receiverSocketStatuses.map(socketStatus => {
              socket.to(socketStatus.socketId).emit("notification", { ...result.notification })
            });
          }
          socket.emit("send_notification_success");
        } else if (!result.success) {
          socket.emit("send_notification_failed");
        }
      } catch (error) {
        socket.emit("send_notification_failed");
        console.log(error);
      }
    })


    socket.on("read_notification", async (json) => {
      try {
        jwt.verify(json.token, process.env.TOKEN_KEY || "");

        const notificationDto = NotificationMapper.mapToDto(json);
        const result = await NotificationService.readNotification(notificationDto);
        if (result.success && result.receiverSocketStatuses && result.receiverSocketStatuses.length) {
          result.receiverSocketStatuses.map(socketStatus => {
            if (socket.id === socketStatus.socketId)
              socket.emit("read_notification", { ...result.notification });
            else
              socket.to(socketStatus.socketId).emit("read_notification", { ...result.notification });
          });
        }
      } catch (error) {
        console.log(error);
      }
    })


    socket.on("course_notification", async (json) => {
      try {
        const user = jwt.verify(json.token, process.env.TOKEN_KEY || "") as jwt.JwtPayload;

        const notificationDto = new CourseNotificationDto();
        notificationDto.content = json.content;
        notificationDto.courseId = json.courseId;
        notificationDto.teacherId = user.userId;

        const resultList = await NotificationService.sendCourseNotification(notificationDto);
        if (resultList.length > 0) {
          resultList.forEach(result => {
            if (result.receiverSocketStatuses && result.receiverSocketStatuses.length) {
              result.receiverSocketStatuses.map(socketStatus => {
                socket.to(socketStatus.socketId).emit("notification", { ...result.notification })
              });
            }
          })
          socket.emit("send_notification_success");
        } else {
          socket.emit("send_notification_failed");
        }
      } catch (error) {
        socket.emit("send_notification_failed");
        console.log(error);
      }
    })
  });
}