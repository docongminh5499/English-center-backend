"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.guard = void 0;
const unauthorized_error_1 = require("../utils/errors/unauthorized.error");
function guard(allowUsers) {
    return (req, res, next) => {
        if (allowUsers.includes(req.user.role))
            next();
        else
            next(new unauthorized_error_1.UnauthorizedError());
    };
}
exports.guard = guard;
