import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "@shared/schema";

const dbUrl = process.env.DATABASE_URL || (() => {
  const host = process.env.DB_HOST || "localhost";
  const port = process.env.DB_PORT || "3306";
  const user = process.env.DB_USER || "root";
  const password = process.env.DB_PASSWORD || "";
  const database = process.env.DB_NAME || "terranova";
  return `mysql://${user}:${password}@${host}:${port}/${database}`;
})();

export const pool = mysql.createPool(dbUrl);
export const db = drizzle(pool, { schema, mode: "default" });
