import { createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { getDb, type Post } from '../db'

const fetchPosts = createServerFn({ method: 'GET' }).handler(
  async (): Promise<Post[]> => {
    const db = getDb()
    const posts = db.prepare('SELECT id, title, content FROM posts ORDER BY id').all() as Post[]
    return posts
  },
)

export const Route = createFileRoute('/')({
  loader: () => fetchPosts(),
  component: function IndexPage() {
    const posts = Route.useLoaderData() as Post[]
    return (
      <div>
        <h1>Blog Posts</h1>
        <ul>
          {posts.map((post) => (
            <li key={post.id}>
              <a href={`/posts/${post.id}`}>{post.title}</a>
            </li>
          ))}
        </ul>
      </div>
    )
  },
})