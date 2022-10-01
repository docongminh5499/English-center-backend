import { UserDto } from "../../../dto";
import MapperInterface from "../../../utils/common/mapper.interface";


class UserMapperImpl implements MapperInterface<UserDto> {
    mapToDto(requestBody: any): UserDto {
        const userDto = new UserDto();
        userDto.id = requestBody.userId;
        return userDto;
    }
}

const UserMapper = new UserMapperImpl();
export default UserMapper;