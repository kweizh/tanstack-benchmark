import { createFileRoute } from '@tanstack/react-router'
import { posts } from '../../db'

export const Route = createFileRoute('/api/posts/$id/like')({
  server: {
    handlers: {
      POST: async ({ request, params }) => {
        const { id } = params

        let body: { fail?: boolean } = {}
        try {
          body = await request.json()
        } catch (e) {
          // Ignore parsing errors or empty body
        }

        if (body && body.fail === true) {
          return new Response(JSON.stringify({ error: 'Simulated failure' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          })
        }

        const post = posts.find((p) => p.id === id)
        if (!post) {
          return new Response(JSON.stringify({ error: 'Post not found' }), {
            status: 404,
            headers: { 'Content-Type': 'application/json' },
          })
        }

        post.likes += 1
        return Response.json(post)
      }
    }
  }
})
