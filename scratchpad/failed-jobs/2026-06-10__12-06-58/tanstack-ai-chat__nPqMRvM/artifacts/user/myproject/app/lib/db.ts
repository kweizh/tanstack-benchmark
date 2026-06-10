// Uses Node 24's built-in SQLite module (no native bindings needed)
import { DatabaseSync } from "node:sqlite";
import path from "node:path";

const DB_PATH = path.resolve(process.cwd(), "notes.db");

let _db: DatabaseSync | null = null;

export function getDb(): DatabaseSync {
  if (!_db) {
    _db = new DatabaseSync(DB_PATH);
    _db.exec(`
      CREATE TABLE IF NOT EXISTS notes (
        id         INTEGER PRIMARY KEY AUTOINCREMENT,
        title      TEXT    NOT NULL,
        content    TEXT    NOT NULL,
        created_at TEXT    DEFAULT (datetime('now'))
      )
    `);
  }
  return _db;
}

export function insertNote(title: string, content: string): number {
  const db = getDb();
  const stmt = db.prepare("INSERT INTO notes (title, content) VALUES (?, ?)");
  const info = stmt.run(title, content);
  return info.lastInsertRowid as number;
}
