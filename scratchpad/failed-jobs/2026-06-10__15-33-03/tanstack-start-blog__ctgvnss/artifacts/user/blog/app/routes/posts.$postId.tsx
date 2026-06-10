import { createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { getDb, type Post } from '../db'
import { marked } from 'marked'

const fetchPost = createServerFn({ method: 'GET' })
  .validator((postId: string) => postId)
  .handler(
    async ({ data: postId }): Promise<Post & { htmlContent: string }> => {
      const db = getDb()
      const post = db.prepare('SELECT id, title, content FROM posts WHERE id = ?').get(postId) as Post | undefined
      if (!post) {
        throw new Error(`Post with id ${postId} not found`)
      }
      const htmlContent = await marked(post.content)
      return { ...post, htmlContent }
    },
  )

export const Route = createFileRoute('/posts/$postId')({
  loader: ({ params }) => fetchPost({ data: params.postId }),
  component: function PostPage() {
    const post = Route.useLoaderData() as Post & { htmlContent: string }
    return (
      <div>
        <h1>{post.title}</h1>
        <div dangerouslySetInnerHTML={{ __html: post.htmlContent }} />
        <a href="/">Back to posts</a>
      </div>
    )
  },
})