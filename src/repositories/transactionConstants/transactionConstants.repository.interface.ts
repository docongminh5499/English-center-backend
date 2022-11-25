import { TransactionConstants } from "../../entities/TransactionConstants";

export default interface TransactionConstantsRepository {
  find: () => Promise<TransactionConstants | null>;
}