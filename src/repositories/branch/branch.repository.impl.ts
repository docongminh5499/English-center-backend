import { Branch } from "../../entities/Branch";
import BranchRepositoryInterface from "./branch.repository.interface";

class BranchRepositoryImpl implements BranchRepositoryInterface {
    async findBranch(): Promise<Branch[]> {
        return await Branch.createQueryBuilder()
            .setLock("pessimistic_read")
            .useTransaction(true)
            .getMany();
    }

}

const BranchRepository = new BranchRepositoryImpl();
export default BranchRepository;