import Database from 'better-sqlite3'
import path from 'node:path'

const DB_PATH = path.resolve(import.meta.dirname, '..', 'blog.db')

let db: Database.Database | null = null

export function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH)
    db.pragma('journal_mode = WAL')
    initializeDb(db)
  }
  return db
}

function initializeDb(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT NOT NULL
    )
  `)
}

export interface Post {
  id: number
  title: string
  content: string
}
