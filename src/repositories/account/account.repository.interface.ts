import { Account } from "../../entities/Account";

export default interface UserRepository {
    findByUserName: (username: string | undefined) => Promise<Account | null>;
}