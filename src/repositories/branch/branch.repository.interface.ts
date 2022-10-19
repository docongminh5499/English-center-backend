import { Branch } from "../../entities/Branch";

export default interface BranchRepository {
    findBranch: () => Promise<Branch[]>;
}