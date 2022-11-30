import { BaseError } from "./base.error";

export class QueryDatabaseError extends BaseError {
  statusCode = 422;

  constructor(message?: string) {
    super("Some error occur when querying database");
    this.message = message || "Some error occur when querying database";
    Object.setPrototypeOf(this, QueryDatabaseError.prototype);
  }

  serialize() {
    return { message: this.message };
  }
}
