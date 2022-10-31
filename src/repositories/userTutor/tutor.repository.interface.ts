import { UserTutor } from "../../entities/UserTutor";

export default interface TutorRepository {
    findTutorsAvailable: (beginingDate: Date, shiftIds: number[], branchId?: number) => Promise<UserTutor[]>;

    findTutorsAvailableInDate: (date: Date, shiftIds: number[], studySession: number, branchId?: number) => Promise<UserTutor[]>;
}