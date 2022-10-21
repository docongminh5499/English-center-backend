import { Shift } from "../../entities/Shift";

export default interface ShiftRepository {
    findById: (id: number | undefined) => Promise<Shift>;
    
    findAvailableShiftsOfTeacher: (teacherId: number, beginingDate: Date) => Promise<Shift[]>;

    findShiftsByStudySession: (studySessionId: number) => Promise<Shift[]>;
}