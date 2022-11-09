import { UserParent } from "../../entities/UserParent";
import Pageable from "../helpers/pageable";

export default interface UserParentRepository {
    findParents: (pageable: Pageable, query?: string) => Promise<UserParent[]>;

    countParents: (query?: string) => Promise<number>;

    findUserParent: (parentId: number) => Promise<UserParent| null>;
}