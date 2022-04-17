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
require("dotenv/config");
const app_1 = require("./app");
const dataSource_1 = require("./utils/functions/dataSource");
(() => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, dataSource_1.initializeDataSource)();
        const PORT = Number(process.env.PORT) || 5000;
        app_1.server.listen(PORT, () => {
            console.log(`Listening on port ${PORT}`);
        });
    }
    catch (error) {
        console.log('Connecting to database failed', error);
    }
}))();
