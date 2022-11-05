import moment = require("moment");
import { StudySessionDto, } from "../../../dto";
import MapperInterface from "../../../utils/common/mapper.interface";

class StudySessionMapperImpl implements MapperInterface<StudySessionDto> {
    mapToDto(requestBody: any): StudySessionDto {
        const dto = new StudySessionDto();
        dto.id = requestBody.id;
        dto.name = requestBody.name;
        dto.date = moment(requestBody.date).toDate();
        dto.shiftIds = requestBody.shiftIds;
        dto.tutorId = requestBody.tutorId;
        dto.teacherId = requestBody.teacherId;
        dto.classroom = requestBody.classroom;
        dto.version = requestBody.version;
        return dto;
    }
}

const StudySessionMapper = new StudySessionMapperImpl();
export default StudySessionMapper;