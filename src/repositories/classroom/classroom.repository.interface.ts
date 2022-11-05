import { Classroom } from "../../entities/Classroom";

export default interface ClassroomRepository {
    findClassroomAvailable: (branchId: number, beginingDate: Date, shiftIds: number[]) => Promise<Classroom[]>;

    findClassroomAvailableInDate: (branchId: number, beginingDate: Date, shiftIds: number[], studySession: number) => Promise<Classroom[]>;
}