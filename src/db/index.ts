import initSqlJs, { type Database } from "sql.js";
import { drizzle, type SQLJsDatabase } from "drizzle-orm/sql-js";
import * as schema from "./schema";
import fs from "fs";
import path from "path";

const DB_PATH = path.join(process.cwd(), "database.sqlite");

let sqliteDb: Database | null = null;
let db: SQLJsDatabase<typeof schema> | null = null;

export async function getDb(): Promise<SQLJsDatabase<typeof schema>> {
  if (db) return db;

  const SQL = await initSqlJs();

  // Load existing database file or create new one
  if (fs.existsSync(DB_PATH)) {
    const buffer = fs.readFileSync(DB_PATH);
    sqliteDb = new SQL.Database(buffer);
  } else {
    sqliteDb = new SQL.Database();
  }

  db = drizzle(sqliteDb, { schema });

  // Create tables if they don't exist
  sqliteDb.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  sqliteDb.run(`
    CREATE TABLE IF NOT EXISTS items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      user_id INTEGER REFERENCES users(id),
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  saveDb();

  return db;
}

export function saveDb(): void {
  if (!sqliteDb) return;

  const data = sqliteDb.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));
}
