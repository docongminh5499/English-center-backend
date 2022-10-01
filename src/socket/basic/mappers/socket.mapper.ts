import { SocketDto } from "../../../dto";
import MapperInterface from "../../../utils/common/mapper.interface";

class SocketMapperImpl implements MapperInterface<SocketDto> {
    mapToDto(socket: any): SocketDto {
        const socketDto = new SocketDto();
        socketDto.id = socket.id;
        return socketDto;
    }

}

const SocketMapper = new SocketMapperImpl();
export default SocketMapper;