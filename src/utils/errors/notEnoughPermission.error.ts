import { BaseError } from "./base.error";

export class NotEnoughPermissionError extends BaseError {
  statusCode = 400;

  constructor() {
    super("You don't have permission to conduct this operation");
    Object.setPrototypeOf(this, NotEnoughPermissionError.prototype);
  }

  serialize() {
    return { message: "You don't have permission to conduct this operation" };
  }
}
