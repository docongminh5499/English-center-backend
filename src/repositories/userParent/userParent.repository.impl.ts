import { UserParent } from "../../entities/UserParent";
import Pageable from "../helpers/pageable";
import UserParentRepositoryInterface from "./userParent.repository.interface";


class UserParentRepositoryImpl implements UserParentRepositoryInterface {
  async findParents(pageable: Pageable, query?: string | undefined): Promise<UserParent[]> {
    let queryStmt = UserParent
      .createQueryBuilder("parent")
      .setLock("pessimistic_read")
      .useTransaction(true)
      .leftJoinAndSelect("parent.user", "user")
      .orderBy("user.fullName", "ASC");
    if (query !== undefined && query.trim().length > 0)
      queryStmt = queryStmt.where("user.fullName LIKE :query", { query: '%' + query + '%' })
        .orWhere("user.id LIKE :query", { query: '%' + query + '%' })
    queryStmt = pageable.buildQuery(queryStmt);
    return await queryStmt.getMany();
  }


  async countParents(query?: string | undefined): Promise<number> {
    let queryStmt = UserParent
      .createQueryBuilder("parent")
      .setLock("pessimistic_read")
      .useTransaction(true)
      .leftJoinAndSelect("parent.user", "user");
    if (query !== undefined && query.trim().length > 0)
      queryStmt = queryStmt.where("user.fullName LIKE :query", { query: '%' + query + '%' })
        .orWhere("user.id LIKE :query", { query: '%' + query + '%' })
    return await queryStmt.getCount();
  }
}


const UserParentRepository = new UserParentRepositoryImpl();
export default UserParentRepository;