import { UserChatEachOther } from "../../entities/UsersChatEachOther";

export default class MessageListDto {
    messages?: Partial<UserChatEachOther>[];
    total?: number;
    limit?: number;
    skip?: number;
}