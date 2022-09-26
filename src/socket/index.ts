import { Server } from "socket.io";
import * as http from "http";
import addMessageEventHandler from "./message";
import addNotificationEventHandler from "./notification";
import addBasicEventHandler from "./basic";

export const socketInitialization = (server: http.Server) => {
  const io = new Server(server, {
    cors: { origin: "http://localhost:3000" }
  });

  addBasicEventHandler(io);
  addMessageEventHandler(io);
  addNotificationEventHandler(io);
}