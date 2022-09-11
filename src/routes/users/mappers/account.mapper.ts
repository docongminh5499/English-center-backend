import MapperInterface from "../../../utils/common/mapper.interface";
import { AccountDto } from "../../../dto";

class AccountMapperImpl implements MapperInterface<AccountDto> {

    mapToDto (requestBody: any) : AccountDto {
        const dto = new AccountDto();
        dto.username = requestBody.username;
        dto.password = requestBody.password;
        dto.role = requestBody.role;
        return dto;
    }
}

const AccountMapper = new AccountMapperImpl();
export default AccountMapper;