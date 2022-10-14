import "reflect-metadata";
import { DataSource } from "typeorm";
import * as entities from "../../entities";

export const AppDataSource = new DataSource({
  host: process.env.DB_CONFIG_HOST,
  type: "mysql",
  port: Number(process.env.DB_CONFIG_PORT) || 3305,
  username: process.env.DB_CONFIG_USERNAME,
  password: process.env.DB_CONFIG_PASSWORD,
  database: process.env.DB_CONFIG_DATABASE,
  maxQueryExecutionTime: 10000,
  ssl: process.env.DEPLOY == "false" ? false : true,
  extra:
    process.env.DEPLOY == "true"
      ? {
        decimalNumbers: true,
        ssl: {
          rejectUnauthorized: !process.env.DEPLOY,
        },
      }
      : { decimalNumbers: true },
  synchronize: process.env.DB_CONFIG_SYNC == "true",
  logging: false,
  entities: entities,
  timezone: "Z",
});

export async function initializeDataSource() {
  console.log("Initialize database...");
  return AppDataSource.initialize();
}
