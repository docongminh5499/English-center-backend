import { BaseError } from "./base.error";

export class DuplicateError extends BaseError {
  statusCode = 409;

  constructor() {
    super("Instance already exists");
    Object.setPrototypeOf(this, DuplicateError.prototype);
  }

  serialize() {
    return { message: "Instance already exists" };
  }
}
