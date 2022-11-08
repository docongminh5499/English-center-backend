import { User } from "../../entities/UserEntity";
import AccountRepository from "../account/account.repository.impl";
import Pageable from "../helpers/pageable";
import SocketStatusRepository from "../socketStatus/socketStatus.repository.impl";
import UserRepositoryInterface from "./user.repository.interface";

class UserRepositoryImpl implements UserRepositoryInterface {
  async findUserByid(userId: number): Promise<User | null> {
    const user = await User
      .findOne({
        where: { id: userId },
        relations: ["socketStatuses"],
        lock: { mode: "pessimistic_read" },
        transaction: true
      });
    return user;
  }

  async findUserByFullName(fullName: string, pageable: Pageable): Promise<User[]> {
    let query = User.createQueryBuilder("user")
      .setLock("pessimistic_read")
      .useTransaction(true)
      .where("user.fullName LIKE :paramFullName", { paramFullName: '%' + fullName + '%' })
      .orderBy({ "user.fullName": "ASC" });
    query = pageable.buildQuery(query);
    const users = await query.getMany();
    for (const user of users)
      user.socketStatuses = await SocketStatusRepository.findAllSocketConnByUser(user.id);
    return users;
  }


  async countUserByFullName(fullName: string): Promise<number> {
    return await User.createQueryBuilder("user")
      .setLock("pessimistic_read")
      .useTransaction(true)
      .where("user.fullName LIKE :paramFullName", { paramFullName: '%' + fullName + '%' })
      .getCount();
  }


  async findUserByUsername(username: string): Promise<User> {
    const account = await AccountRepository.findByUserName(username);
    return account!.user;
  }
}

const UserRepository = new UserRepositoryImpl();
export default UserRepository;