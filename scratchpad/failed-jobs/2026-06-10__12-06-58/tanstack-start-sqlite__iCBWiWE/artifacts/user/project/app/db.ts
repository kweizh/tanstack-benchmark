import Database from "better-sqlite3";
import path from "path";

const DB_PATH = path.resolve(process.cwd(), "sqlite.db");

let _db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!_db) {
    _db = new Database(DB_PATH);
    _db.exec(`
      CREATE TABLE IF NOT EXISTS counter (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        value INTEGER NOT NULL DEFAULT 0
      );
      INSERT OR IGNORE INTO counter (id, value) VALUES (1, 0);
    `);
  }
  return _db;
}
