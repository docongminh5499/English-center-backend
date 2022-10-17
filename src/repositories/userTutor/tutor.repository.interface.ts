import { UserTutor } from "../../entities/UserTutor";

export default interface TutorRepository {
    findTutorsAvailable: (beginingDate: Date, shiftIds: number[]) => Promise<UserTutor[]>;
}