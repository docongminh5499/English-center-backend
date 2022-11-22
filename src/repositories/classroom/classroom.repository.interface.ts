import { Classroom } from "../../entities/Classroom";
import Pageable from "../helpers/pageable";

export default interface ClassroomRepository {
    findClassroomAvailable: (branchId: number, beginingDate: Date, shiftIds: number[], closingDate?: Date, courseSlug?: string) => Promise<Classroom[]>;

    findClassroomAvailableInDate: (branchId: number, beginingDate: Date, shiftIds: number[], studySession: number) => Promise<Classroom[]>;

    findClassroomByBranch: (branchId: number, pageable: Pageable, query?: string) => Promise<Classroom[]>;

    countClassroomByBranch: (branchId: number, query?: string) => Promise<number>;
}