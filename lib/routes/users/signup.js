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
exports.SignupRouter = void 0;
const express = require("express");
const bcrypt = require("bcryptjs");
const Account_1 = require("../../entities/Account");
const duplicate_error_1 = require("../../utils/errors/duplicate.error");
const validateRequest_1 = require("../../middlewares/validateRequest");
const router = express.Router();
exports.SignupRouter = router;
router.post("/sign-up", (0, validateRequest_1.ValidateRequest)(Account_1.Account), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, password, role } = req.body;
        // Check if account exists or not
        const oldUser = yield Account_1.Account.findOne({
            where: { username },
        });
        if (oldUser)
            return next(new duplicate_error_1.DuplicateError());
        // Create new account
        const encryptedPassword = yield bcrypt.hash(password, 10);
        yield Account_1.Account.save({
            username: username,
            password: encryptedPassword,
            role: role,
        });
        // Return result
        return res.status(200).json({ message: "Create account succesful" });
    }
    catch (err) {
        console.log(err);
        next(err);
    }
}));
