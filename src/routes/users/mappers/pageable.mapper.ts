import { PageableDto } from "../../../dto";
import MapperInterface from "../../../utils/common/mapper.interface";


class PageableMapperImpl implements MapperInterface<PageableDto> {
    mapToDto (requestBody: any) : PageableDto {
        const pageableDto = new PageableDto();
        pageableDto.limit = requestBody.limit || 10;
        pageableDto.skip = requestBody.skip || 0;
        return pageableDto;
    }

}

const PageableMapper = new PageableMapperImpl();
export default PageableMapper;