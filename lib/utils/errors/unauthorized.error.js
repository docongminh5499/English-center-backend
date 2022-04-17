"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnauthorizedError = void 0;
const base_error_1 = require("./base.error");
class UnauthorizedError extends base_error_1.BaseError {
    constructor() {
        super("Unauthorized");
        this.statusCode = 401;
        Object.setPrototypeOf(this, UnauthorizedError.prototype);
    }
    serialize() {
        return { message: "Unauthorized" };
    }
}
exports.UnauthorizedError = UnauthorizedError;
