import { CreateCourseDto, } from "../../../dto";
import MapperInterface from "../../../utils/common/mapper.interface";

class CreateCourseDtoMapperImpl implements MapperInterface<CreateCourseDto> {
    mapToDto(requestBody: any): CreateCourseDto {
        const dto = new CreateCourseDto();
        dto.name = requestBody.name;
        dto.maxNumberOfStudent = parseInt(requestBody.maxNumberOfStudent);
        dto.price = parseInt(requestBody.price);
        dto.openingDate = new Date(requestBody.openingDate);
        dto.image = requestBody.file;
        dto.curriculum = parseInt(requestBody.curriculum);
        dto.teacher = parseInt(requestBody.teacher);
        dto.branch = parseInt(requestBody.branch);
        dto.tutors = requestBody.tutors.map((tutorId: any) => parseInt(tutorId));
        dto.classrooms = requestBody.classrooms.map((classroom: any) => ({
            name: classroom.name,
            branchId: parseInt(classroom.branchId)
        }));
        dto.shifts = requestBody.shifts.map((shiftArray: any) => shiftArray.map((id: any) => parseInt(id)));
        return dto;
    }
}

const CreateCourseDtoMapper = new CreateCourseDtoMapperImpl();
export default CreateCourseDtoMapper;