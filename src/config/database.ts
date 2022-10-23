import { DataSource } from "typeorm";

import { User } from "../entities";

require("dotenv").config();

export default new DataSource({
  type: "mysql",
  host: process.env.DB_HOST,
  port: 8889,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [User],
  synchronize: true,
  logging: false,
  multipleStatements: true,
  // dropSchema: true,
});
