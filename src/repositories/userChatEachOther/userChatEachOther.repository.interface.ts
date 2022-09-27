import { User } from "../../entities/UserEntity";
import { UserChatEachOther } from "../../entities/UsersChatEachOther";
import Pageable from "../helpers/pageable";
import Sortable from "../helpers/sortable";

export default interface UserChatEachOtherRepository {
    getLastestMessagesByUserId: (userId: number, sortable: Sortable) => Promise<UserChatEachOther[]>;

    getMessages: (userId: number, targetUserId: number, pageable: Pageable, sortable: Sortable) => Promise<UserChatEachOther[]>;

    countMessages: (userId: number, targetUserId: number, sortable: Sortable) => Promise<number>;

    saveMessage: (sender: User, receiver: User, messageContent: string) => Promise<UserChatEachOther | null>;

    readMessage: (sender: User, receiver: User) => Promise<boolean>;

    getUnreadMessageCount: (receiver: User) => Promise<number>;
}