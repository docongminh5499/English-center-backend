import { BaseError } from "./base.error";

export class InvalidVersionColumnError extends BaseError {
  statusCode = 400;

  constructor(message?: string) {
    super("Version column is not valid");
    this.message = message || "Version column is not valid";
    Object.setPrototypeOf(this, InvalidVersionColumnError.prototype);
  }

  serialize() {
    return { message: this.message };
  }
}
