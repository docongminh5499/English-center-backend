import { BaseError } from "./base.error";
import { ValidationError as ClassValidationError } from "class-validator";

export class ValidationError extends BaseError {
  statusCode = 400;

  constructor(private error: ClassValidationError[] | string[]) {
    super("Some fields of the provided information failed validation");
    Object.setPrototypeOf(this, ValidationError.prototype);
  }

  serialize() {
    const serializeInfo: any = { message: [] };
    this.error.forEach((error) => {
      if (typeof error === "string") serializeInfo.message.push(error);
      else if (error.property) {
        serializeInfo.message.push(error.constraints ? Object.values(error.constraints) : "failed validation");
      }
    });
    return serializeInfo;
  }
}
