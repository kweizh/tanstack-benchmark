import { createFileRoute, Link } from '@tanstack/react-router'
import { getPosts } from '../server-functions/posts'

export const Route = createFileRoute('/')({
  loader: async () => {
    const posts = await getPosts()
    return { posts }
  },
  component: Home,
})

function Home() {
  const { posts } = Route.useLoaderData()

  return (
    <main className="page-wrap px-4 pb-8 pt-14">
      <section className="island-shell rise-in relative overflow-hidden rounded-[2rem] px-6 py-10 sm:px-10 sm:py-14">
        <div className="pointer-events-none absolute -left-20 -top-24 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(79,184,178,0.32),transparent_66%)]" />
        <div className="pointer-events-none absolute -bottom-20 -right-20 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(47,106,74,0.18),transparent_66%)]" />
        <p className="island-kicker mb-3">Blog</p>
        <h1 className="display-title mb-5 max-w-3xl text-4xl leading-[1.02] font-bold tracking-tight text-[var(--sea-ink)] sm:text-6xl">
          Latest Posts
        </h1>
        <p className="mb-8 max-w-2xl text-base text-[var(--sea-ink-soft)] sm:text-lg">
          Thoughts, tutorials, and updates from the team.
        </p>
      </section>

      <section className="mt-8">
        {posts.length === 0 ? (
          <div className="island-shell rounded-2xl p-8 text-center">
            <p className="text-[var(--sea-ink-soft)] text-lg">No posts yet. Check back soon!</p>
          </div>
        ) : (
          <ul className="m-0 list-none space-y-4 p-0">
            {posts.map((post, index) => (
              <li
                key={post.id}
                className="rise-in"
                style={{ animationDelay: `${index * 90 + 80}ms` }}
              >
                <Link
                  to="/posts/$postId"
                  params={{ postId: String(post.id) }}
                  className="island-shell block rounded-2xl p-6 no-underline transition hover:-translate-y-0.5 hover:border-[color-mix(in_oklab,var(--lagoon-deep)_35%,var(--line))]"
                >
                  <h2 className="m-0 mb-2 text-xl font-bold text-[var(--sea-ink)]">
                    {post.title}
                  </h2>
                  <p className="m-0 text-sm text-[var(--sea-ink-soft)]">
                    Post #{post.id}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  )
}
