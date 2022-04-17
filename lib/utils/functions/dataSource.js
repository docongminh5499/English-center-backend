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
exports.initializeDataSource = void 0;
require("reflect-metadata");
const typeorm_1 = require("typeorm");
const entities = require("../../entities");
const AppDataSource = new typeorm_1.DataSource({
    host: process.env.DB_CONFIG_HOST,
    type: "mysql",
    port: Number(process.env.DB_CONFIG_PORT) || 3305,
    username: process.env.DB_CONFIG_USERNAME,
    password: process.env.DB_CONFIG_PASSWORD,
    database: process.env.DB_CONFIG_DATABASE,
    ssl: process.env.DEPLOY == "false" ? false : true,
    extra: process.env.DEPLOY == "true"
        ? {
            ssl: {
                rejectUnauthorized: !process.env.DEPLOY,
            },
        }
        : "",
    synchronize: process.env.DB_CONFIG_SYNC == "true",
    logging: false,
    entities: entities,
});
function initializeDataSource() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("Initialize database...");
        return AppDataSource.initialize();
    });
}
exports.initializeDataSource = initializeDataSource;
