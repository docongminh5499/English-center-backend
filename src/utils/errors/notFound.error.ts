import { BaseError } from "./base.error";

export class NotFoundError extends BaseError {
  statusCode = 404;

  constructor(message?: string) {
    super("Resource or route not found");
    this.message = message || "Resource or route not found";
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }

  serialize() {
    return { message: this.message };
  }
}
