import "reflect-metadata";
import { DataSource } from "typeorm";
import dotenv from "dotenv";

dotenv.config({
  path: process.env.NODE_ENV === "test" ? ".env.test" : ".env",
});

const AppDataSource = new DataSource({
  type: "sqlite",
  database: process.env.DB_DATABASE,
  synchronize: process.env.DB_SYNCHRONIZE === "true",
  entities: ["src/entities/*.entity.ts"],
  logging: process.env.DB_LOGGING === "true",
});

export default AppDataSource;
