"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handlerError = void 0;
const QueryFailedError_1 = require("typeorm/error/QueryFailedError");
const base_error_1 = require("../utils/errors/base.error");
const query_error_1 = require("../utils/errors/query.error");
function handlerError(err, req, res, next) {
    if (err instanceof QueryFailedError_1.QueryFailedError) {
        const error = new query_error_1.QueryDatabaseError();
        return res
            .status(error.statusCode)
            .send(Object.assign({ error: true }, error.serialize()));
    }
    else if (err instanceof base_error_1.BaseError)
        return res.status(err.statusCode).send(Object.assign({ error: true }, err.serialize()));
    return res.status(500).send({ error: true, message: "Internal Error" });
}
exports.handlerError = handlerError;
