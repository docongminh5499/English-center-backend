import { ClassroomFunction } from "../../utils/constants/classroom.constant";

export default class ClassroomDto {
    oldName?: string;
    name?: string;
    branch?: number;
    function?: ClassroomFunction;
    capacity?: number;
    version?: number;
}