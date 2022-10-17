import { BaseError } from "./base.error";

export class InvalidVersionColumnError extends BaseError {
  statusCode = 400;

  constructor() {
    super("Version column is not valid");
    Object.setPrototypeOf(this, InvalidVersionColumnError.prototype);
  }

  serialize() {
    return { message: "Version column is not valid" };
  }
}
