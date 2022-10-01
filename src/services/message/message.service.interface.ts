import { ContactListDto, MessageDto, MessageListDto, MessageResponseDto, PageableDto, SocketDto, UserDto } from "../../dto";

export default interface MessageService {

    message: (socket: SocketDto, message: MessageDto) => Promise<MessageResponseDto>;

    seen: (sender: UserDto, socket: SocketDto) => Promise<MessageResponseDto>;

    getContacts: (userId?: number) => Promise<ContactListDto>;

    findContacts: (name?: string) => Promise<ContactListDto>;

    getMessages: (user: UserDto, targetUser: UserDto, pageable: PageableDto) => Promise<MessageListDto>

    getUnreadMessageCount: (user: UserDto) => Promise<number>;
}