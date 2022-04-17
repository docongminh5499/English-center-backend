"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DuplicateError = void 0;
const base_error_1 = require("./base.error");
class DuplicateError extends base_error_1.BaseError {
    constructor() {
        super("Instance already exists");
        this.statusCode = 409;
        Object.setPrototypeOf(this, DuplicateError.prototype);
    }
    serialize() {
        return { message: "Instance already exists" };
    }
}
exports.DuplicateError = DuplicateError;
