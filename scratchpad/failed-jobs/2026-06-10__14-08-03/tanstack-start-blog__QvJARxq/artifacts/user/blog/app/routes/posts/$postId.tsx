import { createFileRoute, Link } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/start'
import Database from 'better-sqlite3'
import { marked } from 'marked'

const getPost = createServerFn({
  method: 'GET',
})
  .validator((data: number) => data)
  .handler(async ({ data: postId }) => {
    const db = new Database('/home/user/blog/blog.db')
    const post = db.prepare('SELECT id, title, content FROM posts WHERE id = ?').get(postId) as { id: number; title: string; content: string } | undefined
    if (!post) {
      throw new Error('Post not found')
    }
    const htmlContent = marked.parse(post.content)
    return { ...post, htmlContent }
  })

export const Route = createFileRoute('/posts/$postId')({
  loader: async ({ params }) => await getPost({ data: Number(params.postId) }),
  component: Post,
})

function Post() {
  const post = Route.useLoaderData()

  return (
    <div>
      <Link to="/">Back to Home</Link>
      <h1>{post.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: post.htmlContent }} />
    </div>
  )
}
