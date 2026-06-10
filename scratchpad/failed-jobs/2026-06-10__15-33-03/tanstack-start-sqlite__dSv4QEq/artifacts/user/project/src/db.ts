import Database from 'better-sqlite3'
import path from 'node:path'

const DB_PATH = path.join(process.cwd(), 'sqlite.db')

let db: Database.Database | null = null

function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH)
    db.pragma('journal_mode = WAL')
    db.exec(`
      CREATE TABLE IF NOT EXISTS counter (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        count INTEGER NOT NULL DEFAULT 0
      )
    `)
    // Ensure the single row exists
    const row = db.prepare('SELECT count FROM counter WHERE id = 1').get() as { count: number } | undefined
    if (!row) {
      db.prepare('INSERT INTO counter (id, count) VALUES (1, 0)').run()
    }
  }
  return db
}

export function getCount(): number {
  const row = getDb().prepare('SELECT count FROM counter WHERE id = 1').get() as { count: number }
  return row.count
}

export function incrementCount(): number {
  getDb().prepare('UPDATE counter SET count = count + 1 WHERE id = 1').run()
  return getCount()
}