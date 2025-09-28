import "reflect-metadata";
import { DataSource } from "typeorm";

const AppDataSource = new DataSource({
  type: "sqlite",
  database: "db.sqlite",
  synchronize: true,
  entities: ["src/entities/*.entity.ts"],
  logging: true,
});

export default AppDataSource;
