import { Shift } from "../../entities/Shift";

export default interface ShiftRepository {
    findById: (id: number | undefined) => Promise<Shift>;
}