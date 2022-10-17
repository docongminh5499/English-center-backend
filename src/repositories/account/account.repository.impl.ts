import { Account } from "../../entities/Account";
import { User } from "../../entities/UserEntity";
import AccountRepositoryInterface from "./account.repository.interface";

class AccountRepositoryImpl implements AccountRepositoryInterface {
    async findByUserName(username: string | undefined): Promise<Account | null> {
        if (username === undefined)
            return null;

        const account = await Account.findOne({
            where: { username: username },
            relations: ['user']
        });
        return account;
    }

    async findUserByEmail(email: string | undefined): Promise<User | null> {
        if (email === undefined)
            return null;
        const user = await User.findOne({
            where: { email: email }
        });
        return user;
    }


    async findByUserId(userId: number): Promise<Account | null> {
        return await Account.createQueryBuilder('account')
            .leftJoinAndSelect('account.user', 'user')
            .where("user.id = :userId", { userId })
            .getOne();
    }
}

const AccountRepository = new AccountRepositoryImpl();
export default AccountRepository;