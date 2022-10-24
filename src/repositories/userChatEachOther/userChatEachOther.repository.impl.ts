import { validate } from "class-validator";
import { User } from "../../entities/UserEntity";
import { UserChatEachOther } from "../../entities/UsersChatEachOther";
import { ValidationError } from "../../utils/errors/validation.error";
import Pageable from "../helpers/pageable";
import Sortable from "../helpers/sortable";
import UserChatEachOtherRepositoryInterface from "./userChatEachOther.repository.interface";

class UserChatEachOtherImpl implements UserChatEachOtherRepositoryInterface {
  async getLastestMessagesByUserId(userId: number, sortable: Sortable): Promise<UserChatEachOther[]> {
    let query = UserChatEachOther.createQueryBuilder("chat")
      .setLock("pessimistic_read")
      .useTransaction(true)
      .leftJoinAndSelect("chat.sender", "sender")
      .leftJoinAndSelect("sender.socketStatuses", "senderSocketStatuses")
      .leftJoinAndSelect("chat.receiver", "receiver")
      .leftJoinAndSelect("receiver.socketStatuses", "receiverSocketStatuses")
      .where(`chat.id IN (
        SELECT customTable.id FROM (
          select 
            id,
            sendingTime,
            messageContent,
            senderId as userId,
            receiverId as targetId
          from user_chat_each_other uceo 
          WHERE  uceo.senderId = :senderUserId
          UNION 
          select 
            id,
            sendingTime,
            messageContent,
            receiverId  as userId,
            senderId  as targetId
          from user_chat_each_other uceo 
          WHERE  uceo.receiverId = :receiverUserId
      ) customTable inner join (
        select max(sendingTime) as maxSendingTime, userId, targetId 
        from (
          select 
            id,
            sendingTime,
            messageContent,
            senderId as userId,
            receiverId as targetId
          from user_chat_each_other uceo 
          WHERE  uceo.senderId = :senderMaxUserId
          UNION 
          select 
            id,
            sendingTime,
            messageContent,
            receiverId  as userId,
            senderId  as targetId
          from user_chat_each_other uceo 
          WHERE  uceo.receiverId = :receiverMaxUserId
        ) as a
        GROUP by a.userId, a.targetId 
      ) as maxTable on 
      customTable.userId = maxTable.userId 
      and customTable.targetId = maxTable.targetId 
      and customTable.sendingTime = maxTable.maxSendingTime
    )`)
      .setParameter('senderUserId', userId)
      .setParameter('receiverUserId', userId)
      .setParameter('senderMaxUserId', userId)
      .setParameter('receiverMaxUserId', userId);
    query = sortable.buildQuery(query);
    const messages = await query.getMany();
    return messages;
  }



  async getMessages(userId: number, targetUserId: number,
    pageable: Pageable, sortable: Sortable): Promise<UserChatEachOther[]> {
    let query = UserChatEachOther.createQueryBuilder('chat')
      .setLock("pessimistic_read")
      .useTransaction(true)
      .leftJoinAndSelect("chat.sender", "sender")
      .where('chat.senderId = :userSender AND chat.receiverId = :targetReceiver', { userSender: userId, targetReceiver: targetUserId })
      .orWhere('chat.senderId = :targetSender AND chat.receiverId = :userReceiver', { userReceiver: userId, targetSender: targetUserId })

    query = pageable.buildQuery(query);
    query = sortable.buildQuery(query);
    return (await query.getMany());
  }

  async countMessages(userId: number, targetUserId: number, sortable: Sortable): Promise<number> {
    let query = UserChatEachOther.createQueryBuilder('chat')
      .setLock("pessimistic_read")
      .useTransaction(true)
      .where('chat.senderId = :userSender AND chat.receiverId = :targetReceiver', { userSender: userId, targetReceiver: targetUserId })
      .orWhere('chat.senderId = :targetSender AND chat.receiverId = :userReceiver', { userReceiver: userId, targetSender: targetUserId })
    query = sortable.buildQuery(query);
    return (await query.getCount());
  }


  async saveMessage(sender: User, receiver: User, messageContent: string): Promise<UserChatEachOther | null> {
    const message = new UserChatEachOther();
    message.read = false;
    message.sender = sender;
    message.receiver = receiver;
    message.messageContent = messageContent;
    message.sendingTime = new Date();

    const validateErrors = await validate(message);
    if (validateErrors.length) throw new ValidationError(validateErrors);

    const savedMessage = await message.save();
    if (savedMessage.id === undefined) return null;
    return savedMessage;
  }

  async readMessage(sender: User, receiver: User): Promise<boolean> {
    const result = await UserChatEachOther.createQueryBuilder()
      .setLock("pessimistic_write")
      .useTransaction(true)
      .update()
      .set({ read: true })
      .where("senderId = :senderId AND receiverId = :receiverId", {
        senderId: sender.id,
        receiverId: receiver.id
      }).execute();

    return result.affected !== undefined
      && result.affected !== null
      && result.affected > 0;
  }


  async getUnreadMessageCount(receiver: User): Promise<number> {
    const result = await UserChatEachOther.createQueryBuilder("chat")
      .setLock("pessimistic_read")
      .useTransaction(true)
      .where("chat.receiverId = :receiverId", { receiverId: receiver.id })
      .andWhere("chat.read = 0")
      .getCount();
    return result;
  }
}

const UserChatEachOtherRepository = new UserChatEachOtherImpl();
export default UserChatEachOtherRepository;