import { Account } from "../../entities/Account";
import { User } from "../../entities/UserEntity";

export default interface AccountRepository {
    findByUserName: (username: string | undefined) => Promise<Account | null>;

    findUserByEmail: (email: string | undefined) => Promise<User | null>;

    findByUserId: (userId: number) => Promise<Account | null>;
}