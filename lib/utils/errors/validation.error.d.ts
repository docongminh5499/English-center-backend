import { BaseError } from "./base.error";
import { ValidationError as ClassValidationError } from "class-validator";
export declare class ValidationError extends BaseError {
    private error;
    statusCode: number;
    constructor(error: ClassValidationError[]);
    serialize(): any;
}
