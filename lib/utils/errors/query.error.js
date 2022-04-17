"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueryDatabaseError = void 0;
const base_error_1 = require("./base.error");
class QueryDatabaseError extends base_error_1.BaseError {
    constructor() {
        super("Query failed");
        this.statusCode = 422;
        Object.setPrototypeOf(this, QueryDatabaseError.prototype);
    }
    serialize() {
        return { message: "Some error occur when querying database" };
    }
}
exports.QueryDatabaseError = QueryDatabaseError;
