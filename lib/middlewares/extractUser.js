"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractUser = void 0;
const jwt = require("jsonwebtoken");
const role_constant_1 = require("../utils/constants/role.constant");
const invalidToken_error_1 = require("../utils/errors/invalidToken.error");
function extractUser(req, res, next) {
    const token = req.body.token || req.query.token || req.headers["x-access-token"];
    if (!token) {
        req.user = {
            accountId: undefined,
            username: undefined,
            role: role_constant_1.UserRole.GUEST,
        };
        return next();
    }
    try {
        const decoded = jwt.verify(token, process.env.TOKEN_KEY || "");
        req.user = decoded;
        return next();
    }
    catch (err) {
        return next(new invalidToken_error_1.InvalidTokenError());
    }
}
exports.extractUser = extractUser;
