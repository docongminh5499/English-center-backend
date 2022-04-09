import { BaseError } from "./base.error";

export class QueryDatabaseError extends BaseError {
  statusCode = 422;

  constructor() {
    super("Query failed");
    Object.setPrototypeOf(this, QueryDatabaseError.prototype);
  }

  serialize() {
    return { message: "Some error occur when querying database" };
  }
}
