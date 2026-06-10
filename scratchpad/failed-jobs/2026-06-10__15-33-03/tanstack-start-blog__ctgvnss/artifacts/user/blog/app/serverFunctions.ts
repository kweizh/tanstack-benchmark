import { createServerFn } from '@tanstack/react-start'
import { getDb, type Post } from './db'
import { marked } from 'marked'

export const getPosts = createServerFn({ method: 'GET' }).handler(
  async (): Promise<Post[]> => {
    const db = getDb()
    const posts = db.prepare('SELECT id, title, content FROM posts ORDER BY id').all() as Post[]
    return posts
  },
)

export const getPost = createServerFn({ method: 'GET' })
  .validator((id: string) => id)
  .handler(
    async ({ data: id }): Promise<Post & { htmlContent: string }> => {
      const db = getDb()
      const post = db.prepare('SELECT id, title, content FROM posts WHERE id = ?').get(id) as Post | undefined
      if (!post) {
        throw new Error(`Post with id ${id} not found`)
      }
      const htmlContent = await marked(post.content)
      return { ...post, htmlContent }
    },
  )