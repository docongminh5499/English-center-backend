import { CreateCourseDto, } from "../../../dto";
import MapperInterface from "../../../utils/common/mapper.interface";

class CreateCourseDtoMapperImpl implements MapperInterface<CreateCourseDto> {
    mapToDto(requestBody: any): CreateCourseDto {
        const dto = new CreateCourseDto();
        dto.name = requestBody.name;
        dto.maxNumberOfStudent = requestBody.maxNumberOfStudent ? parseInt(requestBody.maxNumberOfStudent) : undefined;
        dto.price = requestBody.price ? parseInt(requestBody.price) : requestBody.price;
        dto.openingDate = requestBody.openingDate ? new Date(requestBody.openingDate) : requestBody.openingDate;
        dto.image = requestBody.file;
        dto.curriculum = requestBody.curriculum ? parseInt(requestBody.curriculum) : requestBody.curriculum;
        dto.teacher = requestBody.teacher ? parseInt(requestBody.teacher) : requestBody.teacher;
        dto.branch = requestBody.branch ? parseInt(requestBody.branch) : requestBody.branch;
        dto.tutors = requestBody.tutors?.map((tutorId: any) => parseInt(tutorId));
        dto.classrooms = requestBody.classrooms?.map((classroom: any) => ({
            name: classroom.name,
            branchId: parseInt(classroom.branchId)
        }));
        dto.shifts = requestBody.shifts?.map((shiftArray: any) => shiftArray.map((id: any) => parseInt(id)));
        dto.version = requestBody.version;
        return dto;
    }
}

const CreateCourseDtoMapper = new CreateCourseDtoMapperImpl();
export default CreateCourseDtoMapper;