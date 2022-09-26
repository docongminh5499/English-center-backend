import { Account } from "../../entities/Account";

export default interface AccountRepository {
    findByUserName: (username: string | undefined) => Promise<Account | null>;
}