import { Server } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { MessageService } from "../../services/message";
import { SocketMapper, UserMapper } from "../basic/mappers";
import { MessageMapper } from "./mappers";

export default function addMessageEventHandler(io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>) {
  io.on("connection", (socket) => {
    socket.on("message", async (json) => {
      try {
        const messageDto = MessageMapper.mapToDto(json);
        const socketDto = SocketMapper.mapToDto(socket);
        if (messageDto.message === undefined || messageDto.message.trim() === "") return;

        const response = await MessageService.message(socketDto, messageDto);
        if (response.addSuccess && response.receiverSocketStatuses && response.receiverSocketStatuses.length) {
          response.receiverSocketStatuses.forEach(socketStatus => {
            if (socket.id === socketStatus.socketId) {
              socket.emit("message", {
                user: response.sender,
                latestMessage: response.latestMessage
              })
            } else {
              socket.to(socketStatus.socketId).emit("message", {
                user: response.sender,
                latestMessage: response.latestMessage
              })
            }
          });
        }

        !response.sendToOneSelf && response.senderSocketStatuses.forEach(socketStatus => {
          if (socket.id === socketStatus.socketId) {
            socket.emit("own_message", {
              user: response.receiver,
              latestMessage: response.latestMessage
            });
          } else {
            socket.to(socketStatus.socketId).emit("own_message", {
              user: response.receiver,
              latestMessage: response.latestMessage
            });
          }
        }
        );
      } catch (error) {
        socket.emit("send_message_failed");
        console.log(error);
      }
    });


    socket.on("seen_message", async (json) => {
      try {
        const senderUserDto = UserMapper.mapToDto(json.sender);
        const socketDto = SocketMapper.mapToDto(socket);
        const response = await MessageService.seen(senderUserDto, socketDto);

        if (response.addSuccess && response.senderSocketStatuses && response.senderSocketStatuses.length) {
          response.senderSocketStatuses.forEach(socketStatus => {
            if (socket.id === socketStatus.socketId) {
              socket.emit("seen_message", { user: response.receiver })
            } else {
              socket.to(socketStatus.socketId).emit("seen_message", { user: response.receiver })
            }
          });
        }

        response.receiverSocketStatuses?.forEach(socketStatus => {
          if (socket.id === socketStatus.socketId) {
            socket.emit("own_seen_message", { user: response.sender })
          } else {
            socket.to(socketStatus.socketId).emit("own_seen_message", { user: response.sender })
          }
        });
      } catch (error) {
        console.log(error);
      }
    });
  });
}