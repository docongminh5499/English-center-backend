import { BaseError } from "./base.error";

export class UnauthorizedError extends BaseError {
  statusCode = 401;

  constructor(message?: string) {
    super("Unauthorized");
    this.message = message || "Unauthorized";
    Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }

  serialize() {
    return { message: this.message };
  }
}
