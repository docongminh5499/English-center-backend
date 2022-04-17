"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationError = void 0;
const base_error_1 = require("./base.error");
class ValidationError extends base_error_1.BaseError {
    constructor(error) {
        super("Some fields of the provided information failed validation");
        this.error = error;
        this.statusCode = 400;
        Object.setPrototypeOf(this, ValidationError.prototype);
    }
    serialize() {
        const serializeInfo = {
            message: "Some fields of the provided information failed validation",
        };
        this.error.forEach((error) => {
            if (error.property) {
                serializeInfo[error.property] = error.constraints
                    ? Object.values(error.constraints)
                    : "failed validation";
            }
        });
        return serializeInfo;
    }
}
exports.ValidationError = ValidationError;
