import { BaseError } from "./base.error";

export class NotFoundError extends BaseError {
  statusCode = 404;

  constructor() {
    super("Resource or route not found");
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }

  serialize() {
    return { message: "Not Found" };
  }
}
