import { BaseError } from "./base.error";

export class DuplicateError extends BaseError {
  statusCode = 409;

  constructor(message?: string) {
    super("Instance already exists");
    this.message = message || "Instance already exists";
    Object.setPrototypeOf(this, DuplicateError.prototype);
  }

  serialize() {
    return { message: this.message };
  }
}
