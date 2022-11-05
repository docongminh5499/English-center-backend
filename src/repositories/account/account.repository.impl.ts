import { Account } from "../../entities/Account";
import { User } from "../../entities/UserEntity";
import AccountRepositoryInterface from "./account.repository.interface";

class AccountRepositoryImpl implements AccountRepositoryInterface {
    async findByUserName(username: string | undefined): Promise<Account | null> {
        if (username === undefined)
            return null;

        const account = await Account.findOne({
            where: { username: username },
            relations: ['user'],
            lock: { mode: "pessimistic_read" },
            transaction: true,
        });
        return account;
    }

    async findUserByEmail(email: string | undefined): Promise<User | null> {
        if (email === undefined)
            return null;
        const user = await User.findOne({
            where: { email: email },
            lock: { mode: "pessimistic_read" },
            transaction: true,
        });
        return user;
    }


    async findByUserId(userId: number): Promise<Account | null> {
        return await Account.createQueryBuilder('account')
            .setLock("pessimistic_read")
            .useTransaction(true)
            .leftJoinAndSelect('account.user', 'user')
            .where("user.id = :userId", { userId })
            .getOne();
    }
}

const AccountRepository = new AccountRepositoryImpl();
export default AccountRepository;