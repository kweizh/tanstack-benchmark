import { createFileRoute, Link, notFound } from '@tanstack/react-router'
import { fetchPost } from '../functions/posts'
import { marked } from 'marked'

export const Route = createFileRoute('/posts/$postId')({
  loader: async ({ params }) => {
    try {
      const post = await fetchPost({ data: { postId: Number(params.postId) } })
      return post
    } catch {
      throw notFound()
    }
  },
  notFoundComponent: () => (
    <div className="container">
      <p>Post not found.</p>
      <Link to="/" className="back-link">← Back to all posts</Link>
    </div>
  ),
  component: PostComponent,
})

function PostComponent() {
  const post = Route.useLoaderData()
  const htmlContent = marked(post.content) as string

  return (
    <div className="container">
      <Link to="/" className="back-link">← Back to all posts</Link>
      <article>
        <div
          className="post-content"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
      </article>
    </div>
  )
}
