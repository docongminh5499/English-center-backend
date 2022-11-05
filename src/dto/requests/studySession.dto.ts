export default class StudySessionDto {
    id: number;
    name: string;
    date: Date;
    shiftIds: number[];
    tutorId: number;
    teacherId: number;
    classroom: {
        name: string;
        branchId: number;
    }
    version: number;
}