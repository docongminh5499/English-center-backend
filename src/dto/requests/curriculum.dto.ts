import { Curriculum } from "../../entities/Curriculum";
import FileDto from "./file.dto";

export default class CurriculumDto {
    curriculum: Curriculum;
    imageFile: FileDto;
}