import { CredentialDto } from "../../../dto";
import MapperInterface from "../../../utils/common/mapper.interface";

class CredentialMapperImpl implements MapperInterface<CredentialDto> {
    mapToDto(request: any): CredentialDto {
        const credentialDto = new CredentialDto();
        credentialDto.token = request.body.token ||
            request.query.token || request.headers["x-access-token"];
        return credentialDto;
    }
}

const CredentialMapper = new CredentialMapperImpl();
export default CredentialMapper;