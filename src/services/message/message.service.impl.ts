import { ContactListDto, MessageDto, MessageListDto, MessageResponseDto, PageableDto, SocketDto, UserDto } from "../../dto";
import { Pageable, SocketStatusRepository, Sortable, UserChatEachOtherRepository, UserRepository } from "../../repositories";
import { InvalidTokenError } from "../../utils/errors/invalidToken.error";
import { NotFoundError } from "../../utils/errors/notFound.error";
import { ValidationError } from "../../utils/errors/validation.error";
import MessageServiceInterface from "./message.service.interface";

class MessageServiceImpl implements MessageServiceInterface {

  async message(socket: SocketDto, message: MessageDto): Promise<MessageResponseDto> {
    const response = new MessageResponseDto();
    response.addSuccess = false;
    response.sendToOneSelf = false;
    response.receiverSocketStatuses = [];
    response.senderSocketStatuses = [];

    const socketStatus = await SocketStatusRepository.findBySocketId(socket.id);
    if (socketStatus === null || socketStatus.user.id !== message.senderId) return response;
    const foundSender = await UserRepository.findUserByid(message.senderId);
    if (foundSender === null) return response;
    const foundReceiver = await UserRepository.findUserByid(message.receiverId);
    if (foundReceiver === null) return response;

    const savedMessage = await UserChatEachOtherRepository.saveMessage(foundSender, foundReceiver, message.message);
    response.addSuccess = savedMessage !== null;
    response.receiverSocketStatuses = foundReceiver.socketStatuses;
    response.senderSocketStatuses = foundSender.socketStatuses;
    response.sendToOneSelf = foundSender.id === foundReceiver.id;

    if (savedMessage !== null) {
      response.latestMessage = {
        messageContent: savedMessage.messageContent,
        read: savedMessage.read,
        sendingTime: savedMessage.sendingTime,
        senderId: foundSender.id,
      }
      response.sender = {
        userAvatar: foundSender.avatar,
        userFullName: foundSender.fullName,
        userRole: foundSender.role,
        userId: foundSender.id,
        isActive: foundSender.socketStatuses && foundSender.socketStatuses.length > 0,
      }
      response.receiver = {
        userAvatar: foundReceiver.avatar,
        userFullName: foundReceiver.fullName,
        userRole: foundReceiver.role,
        userId: foundReceiver.id,
        isActive: foundReceiver.socketStatuses && foundReceiver.socketStatuses.length > 0,
      }
    }
    return response;
  }


  async seen(sender: UserDto, socket: SocketDto): Promise<MessageResponseDto> {
    const response = new MessageResponseDto();
    response.addSuccess = false;
    response.sendToOneSelf = false;
    response.receiverSocketStatuses = [];
    response.senderSocketStatuses = [];

    const socketStatus = await SocketStatusRepository.findBySocketId(socket.id);
    if (socketStatus === null) return response;

    if (sender.id === undefined) return response;
    const foundSender = await UserRepository.findUserByid(sender.id);
    if (foundSender === null) return response;
    const foundReceiver = await UserRepository.findUserByid(socketStatus.user.id);
    if (foundReceiver === null) return response;

    response.addSuccess = await UserChatEachOtherRepository.readMessage(foundSender, foundReceiver);
    response.sender = {
      userAvatar: foundSender.avatar,
      userFullName: foundSender.fullName,
      userRole: foundSender.role,
      userId: foundSender.id,
      isActive: foundSender.socketStatuses && foundSender.socketStatuses.length > 0,
    }
    response.receiver = {
      userAvatar: foundReceiver.avatar,
      userFullName: foundReceiver.fullName,
      userRole: foundReceiver.role,
      userId: foundReceiver.id,
      isActive: foundReceiver.socketStatuses && foundReceiver.socketStatuses.length > 0,
    };
    response.senderSocketStatuses = foundSender.socketStatuses;
    response.receiverSocketStatuses = foundReceiver.socketStatuses;
    return response;
  }


  async getContacts(userId?: number): Promise<ContactListDto> {
    if (userId === undefined)
      throw new InvalidTokenError();

    const sortable = new Sortable().add("sendingTime", "DESC");
    const lastestMessages = await UserChatEachOtherRepository.getLastestMessagesByUserId(userId, sortable);
    const contacts = lastestMessages.map(message => {
      const targetUser = message.receiver.id === userId ? message.sender : message.receiver;

      return ({
        user: {
          userAvatar: targetUser.avatar,
          userFullName: targetUser.fullName,
          userRole: targetUser.role,
          userId: targetUser.id,
          isActive: targetUser.socketStatuses.length > 0,
        },
        latestMessage: {
          messageContent: message.messageContent,
          read: message.read,
          sendingTime: message.sendingTime,
          senderId: message.sender.id,
        }
      });
    });
    const contactListDto = new ContactListDto();
    contactListDto.contacts = contacts;
    return contactListDto;
  }



  async findContacts(name?: string | undefined): Promise<ContactListDto> {
    const contactListDto = new ContactListDto();
    contactListDto.contacts = [];

    if (name === undefined || name.trim() === "") return contactListDto;
    const users = await UserRepository.findUserByFullName(name);
    const contacts = users.map(user => ({
      user: {
        userAvatar: user.avatar,
        userFullName: user.fullName,
        userRole: user.role,
        userId: user.id,
        isActive: user.socketStatuses.length > 0,
      },
    }));
    contactListDto.contacts = contacts;
    return contactListDto;
  }



  async getMessages(user: UserDto, targetUser: UserDto, pageableDto: PageableDto): Promise<MessageListDto> {
    if (user.id === undefined || targetUser.id === undefined)
      throw new ValidationError([]);

    const sortable = new Sortable().add("sendingTime", "DESC");
    const pageable = new Pageable(pageableDto);
    const [messages, messagesCount] = await Promise.all([
      UserChatEachOtherRepository.getMessages(user.id, targetUser.id, pageable, sortable),
      UserChatEachOtherRepository.countMessages(user.id, targetUser.id, sortable)
    ]);

    const messageListDto = new MessageListDto();
    messageListDto.messages = messages.map(message => ({
      messageContent: message.messageContent,
      read: message.read,
      sendingTime: message.sendingTime,
      senderId: message.sender.id,
    }));
    messageListDto.limit = pageable.limit;
    messageListDto.skip = pageable.offset;
    messageListDto.total = messagesCount;

    return messageListDto;
  }


  async getUnreadMessageCount(user: UserDto): Promise<number> {
    if (user.id === undefined)
      throw new NotFoundError();
    const userEntity = await UserRepository.findUserByid(user.id);
    if (userEntity === null)
      throw new NotFoundError();
    return UserChatEachOtherRepository.getUnreadMessageCount(userEntity);
  }
}

const MessageService = new MessageServiceImpl();
export default MessageService;