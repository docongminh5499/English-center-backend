import "reflect-metadata";
import { DataSource } from "typeorm";
import * as entities from "../../entities";

const AppDataSource = new DataSource({
  host: process.env.DB_CONFIG_HOST,
  type: "mysql",
  port: Number(process.env.DB_CONFIG_PORT) || 3305,
  username: process.env.DB_CONFIG_USERNAME,
  password: process.env.DB_CONFIG_PASSWORD,
  database: process.env.DB_CONFIG_DATABASE,
  ssl: process.env.DEPLOY == "false" ? false : true,
  extra:
    process.env.DEPLOY == "true"
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

export async function initializeDataSource() {
  console.log("Initialize database...");
  return AppDataSource.initialize();
}
