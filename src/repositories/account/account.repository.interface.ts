import { Account } from "../../entities/Account";
import { User } from "../../entities/UserEntity";

export default interface UserRepository {
    findByUserName: (username: string | undefined) => Promise<Account | null>;

    findUserByEmail: (email: string | undefined) => Promise<User | null>;
}