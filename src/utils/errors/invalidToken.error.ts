import { BaseError } from "./base.error";

export class InvalidTokenError extends BaseError {
  statusCode = 401;

  constructor(message?: string) {
    super("Provided token is expired or invalid");
    this.message = message || "Provided token is expired or invalid";
    Object.setPrototypeOf(this, InvalidTokenError.prototype);
  }

  serialize() {
    return { message: this.message };
  }
}
