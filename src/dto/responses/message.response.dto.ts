import { LatestMessageContactDto, UserContactDto } from "..";
import { SocketStatus } from "../../entities/SocketStatus";

export default class MessageResponseDto {
    addSuccess: boolean;
    sendToOneSelf: boolean;
    latestMessage: LatestMessageContactDto;
    sender: UserContactDto;
    receiver: UserContactDto;
    receiverSocketStatuses: SocketStatus[];
    senderSocketStatuses: SocketStatus[];
}