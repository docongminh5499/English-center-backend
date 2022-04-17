import { BaseError } from "./base.error";
export declare class InvalidTokenError extends BaseError {
    statusCode: number;
    constructor();
    serialize(): {
        message: string;
    };
}
