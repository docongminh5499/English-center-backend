import { MessageDto } from "../../../dto";
import MapperInterface from "../../../utils/common/mapper.interface";

class MessageMapperImpl implements MapperInterface<MessageDto> {
    mapToDto(requestBody: any) : MessageDto {
        const messageDto = new MessageDto();
        messageDto.message = requestBody.message;
        messageDto.senderId = requestBody.senderId;
        messageDto.receiverId = requestBody.receiverId;
        return messageDto;
    }

}

const MessageMapper = new MessageMapperImpl();
export default MessageMapper;