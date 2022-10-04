import { Server } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { SocketService } from "../../services/socket";
import { SocketMapper, UserMapper } from "./mappers";
import * as jwt from "jsonwebtoken";

export default function addBasicEventHandler(io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>) {
  io.on("connection", (socket) => {
    socket.on("signin", async (json) => {
      try {
        jwt.verify(json.token, process.env.TOKEN_KEY || "");
        const userDto = UserMapper.mapToDto(json);
        const socketDto = SocketMapper.mapToDto(socket);
        const addSuccess = await SocketService.signin(userDto, socketDto);
        if (addSuccess) socket.broadcast.emit("signin", json);
      } catch (error) {
        console.log(error)
      }
    });


    socket.on("signout", async (json) => {
      try {
        jwt.verify(json.token, process.env.TOKEN_KEY || "");
        const socketDto = SocketMapper.mapToDto(socket);
        const result = await SocketService.signout(socketDto);
        if (result.connLeft === 0 && result.userId !== undefined)
          socket.broadcast.emit("signout", result);
      } catch (error) {
        console.log(error)
      }
    })


    socket.on("disconnect", async () => {
      try {
        const socketDto = SocketMapper.mapToDto(socket);
        const result = await SocketService.signout(socketDto);
        if (result.connLeft === 0 && result.userId !== undefined)
          socket.broadcast.emit("signout", result);
      } catch (error) {
        console.log(error)
      }
    });
  });
}