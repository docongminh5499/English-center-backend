import { BaseError } from "./base.error";
export declare class QueryDatabaseError extends BaseError {
    statusCode: number;
    constructor();
    serialize(): {
        message: string;
    };
}
