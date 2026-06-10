import { createFileRoute } from '@tanstack/react-router'
import { postsStore } from '../../store'

export const Route = createFileRoute('/api/posts/$id/like')({
  server: {
    handlers: {
      POST: async ({ request, params }) => {
        const { id } = params

        let body: { fail?: boolean } = {}
        try {
          body = await request.json()
        } catch {
          // empty body is fine
        }

        if (body.fail === true) {
          return Response.json({ error: 'Simulated failure' }, { status: 500 })
        }

        const post = postsStore.find((p) => p.id === id)
        if (!post) {
          return Response.json({ error: 'Post not found' }, { status: 404 })
        }

        post.likes += 1
        return Response.json(post)
      },
    },
  },
})
