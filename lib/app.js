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
exports.server = void 0;
const express = require("express");
const http = require("http");
const cors = require("cors");
const users_1 = require("./routes/users");
const teachers_1 = require("./routes/teachers");
const body_parser_1 = require("body-parser");
const notFound_error_1 = require("./utils/errors/notFound.error");
const handlerError_1 = require("./middlewares/handlerError");
const extractUser_1 = require("./middlewares/extractUser");
const app = express();
app.set("trust proxy", true);
app.use(cors());
app.use((0, body_parser_1.json)());
app.use((0, body_parser_1.urlencoded)({ extended: true }));
app.use(extractUser_1.extractUser);
app.use("/api/users", users_1.default);
app.use("/api/teachers", teachers_1.default);
app.all("*", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    return next(new notFound_error_1.NotFoundError());
}));
app.use(handlerError_1.handlerError);
const server = http.createServer(app);
exports.server = server;
