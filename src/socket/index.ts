import { Server } from "socket.io";
import * as http from "http";
import addMessageEventHandler from "./message";
import addNotificationEventHandler from "./notification";
import addBasicEventHandler from "./basic";
import { DefaultEventsMap } from "socket.io/dist/typed-events";

let io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>;
export const socketInitialization = (server: http.Server) => {
  io = new Server(server, {
    cors: { origin: "http://localhost:3000" }
  });

  addBasicEventHandler(io);
  addMessageEventHandler(io);
  addNotificationEventHandler(io);
}
export { io };