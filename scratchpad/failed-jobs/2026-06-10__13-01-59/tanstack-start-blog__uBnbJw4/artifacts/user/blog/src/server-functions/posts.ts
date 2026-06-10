import { createServerFn } from '@tanstack/react-start'
import { getDb } from '../db'
import type { Post } from '../db'

export const getPosts = createServerFn({ method: 'GET' }).handler(async (): Promise<Post[]> => {
  const db = getDb()
  const posts = db.prepare('SELECT id, title, content FROM posts ORDER BY id DESC').all() as Post[]
  return posts
})

export const getPostById = createServerFn({ method: 'GET' })
  .validator((data: unknown) => {
    const id = typeof data === 'number' ? data : Number(data)
    if (isNaN(id) || id < 1) {
      throw new Error('Invalid post ID')
    }
    return id
  })
  .handler(async ({ data: id }): Promise<Post | null> => {
    const db = getDb()
    const post = db.prepare('SELECT id, title, content FROM posts WHERE id = ?').get(id) as Post | undefined
    return post ?? null
  })
