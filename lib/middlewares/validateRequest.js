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
exports.ValidateRequest = void 0;
const class_validator_1 = require("class-validator");
const validation_error_1 = require("../utils/errors/validation.error");
const ValidateRequest = (EntityClass) => (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    req.body = Object.assign(new EntityClass(), req.body);
    const validateErrors = yield (0, class_validator_1.validate)(req.body);
    if (validateErrors.length)
        return next(new validation_error_1.ValidationError(validateErrors));
    next();
});
exports.ValidateRequest = ValidateRequest;
