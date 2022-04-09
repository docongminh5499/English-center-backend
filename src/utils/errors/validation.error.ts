import { BaseError } from "./base.error";
import { ValidationError as ClassValidationError } from "class-validator";

export class ValidationError extends BaseError {
  statusCode = 400;

  constructor(private error: ClassValidationError[]) {
    super("Some fields of the provided information failed validation");
    Object.setPrototypeOf(this, ValidationError.prototype);
  }

  serialize() {
    const serializeInfo: any = {
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
