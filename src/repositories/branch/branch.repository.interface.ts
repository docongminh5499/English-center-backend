import { Branch } from "../../entities/Branch";

export default interface BranchRepository {
    findBranch: () => Promise<Branch[]>;

    checkIsManager: (userId: number) => Promise<boolean>;
}