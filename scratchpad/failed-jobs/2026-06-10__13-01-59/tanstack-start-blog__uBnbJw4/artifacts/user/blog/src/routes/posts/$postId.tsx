import { createFileRoute, Link, notFound } from '@tanstack/react-router'
import { marked } from 'marked'
import { getPostById } from '../../server-functions/posts'

export const Route = createFileRoute('/posts/$postId')({
  loader: async ({ params }) => {
    const postId = Number(params.postId)
    if (isNaN(postId)) {
      throw notFound()
    }
    const post = await getPostById({ data: postId })
    if (!post) {
      throw notFound()
    }
    const htmlContent = await marked.parse(post.content)
    return { post, htmlContent }
  },
  component: PostDetail,
  notFoundComponent: PostNotFound,
})

function PostDetail() {
  const { post, htmlContent } = Route.useLoaderData()

  return (
    <main className="page-wrap px-4 pb-8 pt-14">
      <Link
        to="/"
        className="mb-6 inline-flex items-center gap-1 text-sm font-semibold text-[var(--lagoon-deep)] no-underline hover:underline"
      >
        ← Back to all posts
      </Link>

      <article className="island-shell rise-in rounded-[2rem] px-6 py-10 sm:px-10 sm:py-14">
        <p className="island-kicker mb-3">Post #{post.id}</p>
        <h1 className="display-title mb-8 text-4xl leading-[1.02] font-bold tracking-tight text-[var(--sea-ink)] sm:text-6xl">
          {post.title}
        </h1>
        <div
          className="prose prose-lg max-w-none text-[var(--sea-ink)] [&_h1]:text-[var(--sea-ink)] [&_h2]:text-[var(--sea-ink)] [&_h3]:text-[var(--sea-ink)] [&_p]:text-[var(--sea-ink-soft)] [&_li]:text-[var(--sea-ink-soft)] [&_code]:text-[var(--lagoon-deep)] [&_pre]:bg-[var(--chip-bg)] [&_pre]:border [&_pre]:border-[var(--line)] [&_blockquote]:border-[var(--lagoon)] [&_blockquote]:text-[var(--sea-ink-soft)] [&_a]:text-[var(--lagoon-deep)] [&_strong]:text-[var(--sea-ink)]"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
      </article>
    </main>
  )
}

function PostNotFound() {
  return (
    <main className="page-wrap px-4 pb-8 pt-14">
      <div className="island-shell rise-in rounded-[2rem] px-6 py-10 text-center sm:px-10 sm:py-14">
        <h1 className="display-title mb-4 text-4xl font-bold text-[var(--sea-ink)]">
          Post Not Found
        </h1>
        <p className="mb-6 text-[var(--sea-ink-soft)]">
          The post you're looking for doesn't exist.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--lagoon-deep)] no-underline hover:underline"
        >
          ← Back to all posts
        </Link>
      </div>
    </main>
  )
}
