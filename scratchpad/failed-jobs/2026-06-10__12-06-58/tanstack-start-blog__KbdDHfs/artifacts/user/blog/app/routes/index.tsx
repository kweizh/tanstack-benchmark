import { createFileRoute, Link } from '@tanstack/react-router'
import { fetchPosts } from '../functions/posts'

export const Route = createFileRoute('/')({
  loader: () => fetchPosts(),
  component: HomeComponent,
})

function HomeComponent() {
  const posts = Route.useLoaderData()

  return (
    <div className="container">
      <h2 style={{ marginBottom: '1.5rem', fontSize: '1.4rem' }}>All Posts</h2>
      {posts.length === 0 ? (
        <p>No posts yet.</p>
      ) : (
        <ul className="post-list">
          {posts.map((post) => (
            <li key={post.id}>
              <h2>
                <Link to="/posts/$postId" params={{ postId: String(post.id) }}>
                  {post.title}
                </Link>
              </h2>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
