import MapperInterface from "../../../utils/common/mapper.interface";
import { UserDto } from "../../../dto";

class UserMapperImpl implements MapperInterface<UserDto> {
    mapToDto(requestBody: any): UserDto {
        const userDto = new UserDto();
        userDto.id = requestBody.id;
        return userDto;
    }

}

const UserMapper = new UserMapperImpl();
export default UserMapper;