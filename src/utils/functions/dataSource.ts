import "reflect-metadata";
import { DataSource } from "typeorm";
import * as entities from "../../entities";

export const AppDataSource = new DataSource({
  host: process.env.DB_CONFIG_HOST,
  type: "mysql",
  port: process.env.DEPLOY == "false" ? (Number(process.env.DB_CONFIG_PORT) || 3305) : undefined,
  username: process.env.DB_CONFIG_USERNAME,
  password: process.env.DB_CONFIG_PASSWORD,
  database: process.env.DB_CONFIG_DATABASE,
  maxQueryExecutionTime: 10000,
  ssl: process.env.DEPLOY == "false" ? false : true,
  extra:
    process.env.DEPLOY == "true"
      ? {
        socketPath: process.env.DB_CONFIG_HOST,
        decimalNumbers: true,
        ssl: {
          rejectUnauthorized: !process.env.DEPLOY,
        },
      }
      : { decimalNumbers: true },
  synchronize: process.env.DB_CONFIG_SYNC == "true",
  logging: false,
  entities: entities,
});

export async function initializeDataSource() {
  console.log("Connecting to database...");
  return AppDataSource.initialize();
}
