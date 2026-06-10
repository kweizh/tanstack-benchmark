import Database from 'better-sqlite3'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dbPath = path.resolve(__dirname, '..', '..', 'notes.db')

let db: Database.Database | null = null

export function getDb(): Database.Database {
  if (!db) {
    db = new Database(dbPath)
    db.pragma('journal_mode = WAL')
    initializeSchema()
  }
  return db
}

function initializeSchema() {
  const database = db!
  database.exec(`
    CREATE TABLE IF NOT EXISTS notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `)
}

export interface Note {
  id: number
  title: string
  content: string
  created_at: string
  updated_at: string
}

export function insertNote(title: string, content: string): Note {
  const database = getDb()
  const stmt = database.prepare(
    'INSERT INTO notes (title, content) VALUES (?, ?)'
  )
  const result = stmt.run(title, content)
  const row = database
    .prepare('SELECT * FROM notes WHERE id = ?')
    .get(result.lastInsertRowid) as Note
  return row
}

export function getAllNotes(): Note[] {
  const database = getDb()
  return database.prepare('SELECT * FROM notes ORDER BY created_at DESC').all() as Note[]
}
