import { BaseError } from "./base.error";

export class SystemError extends BaseError {
    statusCode = 500;

    constructor(message?: string) {
        super("System Interal Error");
        this.message = message || "System Interal Error";
        Object.setPrototypeOf(this, SystemError.prototype);
    }

    serialize() {
        return { message: this.message };
    }
}
