import { createFileRoute, Link } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import Database from 'better-sqlite3'

const getPosts = createServerFn({
  method: 'GET',
}).handler(async () => {
  const db = new Database('/home/user/blog/blog.db')
  const posts = db.prepare('SELECT id, title FROM posts').all()
  return posts as { id: number; title: string }[]
})

export const Route = createFileRoute('/')({
  loader: async () => await getPosts(),
  component: Index,
})

function Index() {
  const posts = Route.useLoaderData()

  return (
    <div>
      <h1>Blog Posts</h1>
      <ul>
        {posts.map((post) => (
          <li key={post.id}>
            <Link to={`/posts/${post.id}`}>{post.title}</Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
