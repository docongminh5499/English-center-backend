import { BaseError } from "./base.error";
export declare class UnauthorizedError extends BaseError {
    statusCode: number;
    constructor();
    serialize(): {
        message: string;
    };
}
