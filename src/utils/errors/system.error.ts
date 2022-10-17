import { BaseError } from "./base.error";

export class SystemError extends BaseError {
    statusCode = 500;

    constructor() {
        super("System Interal Error");
        Object.setPrototypeOf(this, SystemError.prototype);
    }

    serialize() {
        return { message: "System Interal Error" };
    }
}
