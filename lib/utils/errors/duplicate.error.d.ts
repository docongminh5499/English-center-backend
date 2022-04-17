import { BaseError } from "./base.error";
export declare class DuplicateError extends BaseError {
    statusCode: number;
    constructor();
    serialize(): {
        message: string;
    };
}
