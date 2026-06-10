import Database from 'better-sqlite3'
import path from 'path'

const DB_PATH = path.resolve('/home/user/blog/blog.db')

let db: Database.Database | null = null

export function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH)
    db.pragma('journal_mode = WAL')
    initDb(db)
  }
  return db
}

function initDb(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY,
      title TEXT NOT NULL,
      content TEXT NOT NULL
    )
  `)

  const count = (db.prepare('SELECT COUNT(*) as count FROM posts').get() as { count: number }).count
  if (count === 0) {
    const insert = db.prepare('INSERT INTO posts (title, content) VALUES (?, ?)')
    insert.run(
      'Welcome to My Blog',
      `# Welcome to My Blog\n\nThis is the **first post** on my blog.\n\n## What to Expect\n\nI'll be writing about:\n\n- Technology\n- Programming\n- Open Source\n\n> Stay tuned for more content!\n\nHere is some \`inline code\` and a code block:\n\n\`\`\`js\nconsole.log("Hello, World!");\n\`\`\`\n`
    )
    insert.run(
      'Getting Started with TanStack Start',
      `# Getting Started with TanStack Start\n\nTanStack Start is a **full-stack React framework** powered by TanStack Router.\n\n## Features\n\n1. File-based routing\n2. Server functions\n3. Full-stack type safety\n\n### Installation\n\n\`\`\`bash\nnpm create tanstack@latest\n\`\`\`\n\nLearn more at the [official docs](https://tanstack.com/start).\n`
    )
  }
}
