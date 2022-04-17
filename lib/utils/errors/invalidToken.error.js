"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvalidTokenError = void 0;
const base_error_1 = require("./base.error");
class InvalidTokenError extends base_error_1.BaseError {
    constructor() {
        super("Provided token is expired or invalid");
        this.statusCode = 401;
        Object.setPrototypeOf(this, InvalidTokenError.prototype);
    }
    serialize() {
        return { message: "Provided token is expired or invalid" };
    }
}
exports.InvalidTokenError = InvalidTokenError;
