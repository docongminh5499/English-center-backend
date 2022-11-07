import { ClassroomDto } from "../../../dto";
import MapperInterface from "../../../utils/common/mapper.interface";


class ClassroomDtoMapper implements MapperInterface<ClassroomDto> {
    mapToDto(requestBody: any): ClassroomDto {
        const classroomDto = new ClassroomDto();
        classroomDto.oldName = requestBody.oldName;
        classroomDto.name = requestBody.name;
        classroomDto.branch = requestBody.branchId;
        classroomDto.capacity = requestBody.capacity;
        classroomDto.function = requestBody.function;
        classroomDto.version = requestBody.version;
        return classroomDto;
    }

}

const ClassroomMapper = new ClassroomDtoMapper();
export default ClassroomMapper;