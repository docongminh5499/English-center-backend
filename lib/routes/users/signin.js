"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SigninRouter = void 0;
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Account_1 = require("../../entities/Account");
const validation_error_1 = require("../../utils/errors/validation.error");
const notFound_error_1 = require("../../utils/errors/notFound.error");
const router = express.Router();
exports.SigninRouter = router;
router.post("/sign-in", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const username = req.body.username;
        const password = req.body.password;
        if (!(username && password)) {
            return next(new validation_error_1.ValidationError([]));
        }
        const account = yield Account_1.Account.findOne({ where: { username } });
        if (account && (yield bcrypt.compare(password, account.password))) {
            const token = jwt.sign({
                accountId: account.id,
                username: account.username,
                role: account.role,
            }, process.env.TOKEN_KEY || "", {
                expiresIn: "1d",
            });
            const decodeJWT = jwt.decode(token);
            return res.status(200).json({
                username: account.username,
                role: account.role,
                token: token,
                expireTime: decodeJWT === null || decodeJWT === void 0 ? void 0 : decodeJWT.exp,
            });
        }
        return next(new notFound_error_1.NotFoundError());
    }
    catch (err) {
        console.log(err);
        next(err);
    }
}));
