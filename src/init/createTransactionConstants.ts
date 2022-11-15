import { TransactionConstants } from "../entities/TransactionConstants"

export const createTransactionConstants = async () => {
    const transactionConstants = new TransactionConstants();
    transactionConstants.feeDay = 5;
    transactionConstants.feeDueDay = 12;
    transactionConstants.salaryDay = 28;
    transactionConstants.baseSalary = 4000000;
    transactionConstants.teacherProportion = 0.1;
    transactionConstants.tutorProportion = 0.1;
    return await transactionConstants.save();
}