import { Shift } from "../../entities/Shift";
import ShiftRepositoryInterface from "./shift.repository.interface";

class ShiftRepositoryImpl implements ShiftRepositoryInterface {
    async findById(id: number | undefined) : Promise<Shift> {
        const shift = await Shift.findOne({
            where: { id: id }
        });
        return shift!;
    }
}

const ShiftRepository = new ShiftRepositoryImpl();
export default ShiftRepository;