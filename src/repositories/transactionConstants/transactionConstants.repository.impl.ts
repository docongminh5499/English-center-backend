import { TransactionConstants } from "../../entities/TransactionConstants";
import TransactionConstantsRepositoryInterface from "./transactionConstants.repository.interface";


class TransactionConstantsRepositoryImpl implements TransactionConstantsRepositoryInterface {
  async find(): Promise<TransactionConstants | null> {
    return await TransactionConstants
      .createQueryBuilder("c")
      .setLock("pessimistic_read")
      .useTransaction(true)
      .getOne();
  }

}


const TransactionConstantsRepository = new TransactionConstantsRepositoryImpl();
export default TransactionConstantsRepository;