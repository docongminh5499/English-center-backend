import { Shift } from "../../entities/Shift";
import { UserTutor } from "../../entities/UserTutor";
import Pageable from "../helpers/pageable";

export default interface TutorRepository {
    findTutorsAvailable: (beginingDate: Date, shiftIds: number[], branchId?: number, closingDate?: Date, courseSlug?: string) => Promise<UserTutor[]>;

    findTutorsAvailableInDate: (date: Date, shiftIds: number[], studySession: number, branchId?: number) => Promise<UserTutor[]>;

    findFreeShiftsOfTutor: (tutorId: number) => Promise<Shift[]>;

    findTutorById: (tutorId: number) => Promise<UserTutor | null>;

    findTutorByBranch: (branchId: number, pageable: Pageable, query?: string) => Promise<UserTutor[]>;

    countTutorByBranch: (branchId: number, query?: string) => Promise<number>;
}