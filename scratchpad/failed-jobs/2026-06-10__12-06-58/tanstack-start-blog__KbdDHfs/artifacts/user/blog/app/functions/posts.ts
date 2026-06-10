import { createServerFn } from '@tanstack/start'
import { getDb } from '../db'

export type Post = {
  id: number
  title: string
  content: string
}

export const fetchPosts = createServerFn({ method: 'GET' }).handler(async () => {
  const db = getDb()
  const posts = db.prepare('SELECT id, title, content FROM posts ORDER BY id ASC').all() as Post[]
  return posts
})

export const fetchPost = createServerFn({ method: 'GET' })
  .validator((data: { postId: number }) => data)
  .handler(async ({ data }) => {
    const db = getDb()
    const post = db.prepare('SELECT id, title, content FROM posts WHERE id = ?').get(data.postId) as Post | undefined
    if (!post) {
      throw new Error(`Post with id ${data.postId} not found`)
    }
    return post
  })
