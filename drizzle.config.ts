import { defineConfig } from "drizzle-kit";

const dbUrl = process.env.DATABASE_URL || (() => {
  const host = process.env.DB_HOST || "localhost";
  const port = process.env.DB_PORT || "3306";
  const user = process.env.DB_USER || "root";
  const password = process.env.DB_PASSWORD || "";
  const database = process.env.DB_NAME || "terranova";
  return `mysql://${user}:${password}@${host}:${port}/${database}`;
})();

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "mysql",
  dbCredentials: {
    url: dbUrl,
  },
});
