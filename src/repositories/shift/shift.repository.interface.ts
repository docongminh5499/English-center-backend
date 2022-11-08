import { Shift } from "../../entities/Shift";
import { Weekday } from "../../utils/constants/weekday.constant";

export default interface ShiftRepository {
    findById: (id: number | undefined) => Promise<Shift>;
    
    findAvailableShiftsOfTeacher: (teacherId: number, beginingDate: Date) => Promise<Shift[]>;

    findShiftsByStudySession: (studySessionId: number) => Promise<Shift[]>;

    findShiftsByWeekDay: (weekday: Weekday) => Promise<Shift[]>;

    findAllShifts: () => Promise<Shift[]>;
}