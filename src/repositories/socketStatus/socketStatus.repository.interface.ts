import { SocketStatus } from "../../entities/SocketStatus";
import { User } from "../../entities/UserEntity";

export default interface SocketStatusRepository {
    add: (socketId: string, user: User) => Promise<boolean>;

    remove: (socketId: string) => Promise<boolean>;

    findBySocketId: (socketId: string) => Promise<SocketStatus | null>;

    findAllSocketConnByUser: (userId: number) => Promise<SocketStatus[]>;
}