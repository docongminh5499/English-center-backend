import { NotificationDto } from "../../../dto";
import MapperInterface from "../../../utils/common/mapper.interface";

class NotificationMapperImpl implements MapperInterface<NotificationDto> {
    mapToDto(requestBody: any): NotificationDto {
        const notificationDto = new NotificationDto();
        notificationDto.id = requestBody.id;
        notificationDto.userId = requestBody.userId;
        notificationDto.content = requestBody.content;
        return notificationDto;
    }

}

const NotificationMapper = new NotificationMapperImpl();
export default NotificationMapper;