import { Account } from "../../entities/Account";
import AccountRepositoryInterface from "./account.repository.interface";

class AccountRepositoryImpl implements AccountRepositoryInterface {
    async findByUserName (username: string | undefined) : Promise<Account | null> {
        if (username === undefined)
            return null;
            
        const account = await Account.findOne({ 
            where: { username: username }, 
            relations: ['user'] 
        });
        return account;
    }
}

const AccountRepository = new AccountRepositoryImpl();
export default AccountRepository;