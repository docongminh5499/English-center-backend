import FileDto from "./file.dto";

export default class CreateCourseDto {
    name?: string;
    maxNumberOfStudent?: number;
    price?: number;
    openingDate?: Date;
    image?: FileDto;
    curriculum?: number;
    teacher?: number;
    branch?: number;
    tutors?: number[];
    classrooms?: {
        name: string;
        branchId: number;
    }[];
    shifts?: number[][];
}