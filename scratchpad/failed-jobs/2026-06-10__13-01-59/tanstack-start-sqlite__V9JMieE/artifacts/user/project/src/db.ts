import Database from 'better-sqlite3'
import path from 'node:path'

const DB_PATH = path.join(process.cwd(), 'sqlite.db')

let db: Database.Database

function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH)
    db.pragma('journal_mode = WAL')
    db.exec(`
      CREATE TABLE IF NOT EXISTS counter (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        value INTEGER NOT NULL DEFAULT 0
      )
    `)
    // Ensure the row exists
    const row = db.prepare('SELECT id FROM counter WHERE id = 1').get() as
      | { id: number }
      | undefined
    if (!row) {
      db.prepare('INSERT INTO counter (id, value) VALUES (1, 0)').run()
    }
  }
  return db
}

export function getCount(): number {
  const database = getDb()
  const row = database
    .prepare('SELECT value FROM counter WHERE id = 1')
    .get() as { value: number }
  return row.value
}

export function incrementCount(): number {
  const database = getDb()
  const result = database
    .prepare('UPDATE counter SET value = value + 1 WHERE id = 1 RETURNING value')
    .get() as { value: number }
  return result.value
}
