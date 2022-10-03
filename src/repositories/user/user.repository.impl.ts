import { User } from "../../entities/UserEntity";
import AccountRepository from "../account/account.repository.impl";
import UserRepositoryInterface from "./user.repository.interface";

class UserRepositoryImpl implements UserRepositoryInterface {
  async findUserByid(userId: number): Promise<User | null> {
    const user = await User
      .findOne({
        where: { id: userId },
        relations: ["socketStatuses"]
      });
    return user;
  }

  async findUserByFullName(fullName: string): Promise<User[]> {
    return User.createQueryBuilder("user")
      .leftJoinAndSelect("user.socketStatuses", "socketStatuses")
      .where("user.fullName LIKE :paramFullName", { paramFullName: '%' + fullName + '%' })
      .getMany();
  }

  async findUserByUsername(username: string) : Promise<User>{
    const account = await AccountRepository.findByUserName(username);
    return account!.user;
  }
}

const UserRepository = new UserRepositoryImpl();
export default UserRepository;