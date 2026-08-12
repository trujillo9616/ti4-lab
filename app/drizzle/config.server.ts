import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import Database from "better-sqlite3";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const databasePath = process.env.TI4_LAB_DATABASE_PATH ??
  (process.env.NODE_ENV === "production"
    ? undefined
    : pathToFileURL(resolve("sqlite.db")).toString());

if (!databasePath) {
  throw new Error("Missing environment variable: TI4_LAB_DATABASE_PATH");
}

export const db = drizzle(
  new Database(new URL(databasePath).pathname),
);
// Automatically run migrations on startup
void migrate(db, {
  migrationsFolder: "app/drizzle/migrations",
});
