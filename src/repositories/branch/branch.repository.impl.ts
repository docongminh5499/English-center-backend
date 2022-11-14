import { Branch } from "../../entities/Branch";
import BranchRepositoryInterface from "./branch.repository.interface";

class BranchRepositoryImpl implements BranchRepositoryInterface {
    async findBranch(): Promise<Branch[]> {
        return await Branch.createQueryBuilder()
            .setLock("pessimistic_read")
            .useTransaction(true)
            .getMany();
    }


    async checkIsManager(userId: number): Promise<boolean> {
        const result = await Branch.createQueryBuilder("branch")
            .setLock("pessimistic_read")
            .useTransaction(true)
            .where("branch.employeeId = :employeeId", { employeeId: userId })
            .orWhere("branch.teacherId = :teacherId", { teacherId: userId })
            .getCount();
        return result > 0;
    }
}

const BranchRepository = new BranchRepositoryImpl();
export default BranchRepository;