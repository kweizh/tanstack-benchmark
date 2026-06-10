import { createFileRoute } from '@tanstack/react-router'
import { getAllComments, createComment } from '../../server/store'

export const Route = createFileRoute('/api/comments')({
  server: {
    handlers: {
      GET: async () => {
        const comments = getAllComments()
        return new Response(JSON.stringify(comments), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      },
      POST: async ({ request }) => {
        const url = new URL(request.url)
        const shouldFail = url.searchParams.get('fail') === '1'

        // Artificial delay of at least 300ms so optimistic update is observable
        await new Promise((resolve) => setTimeout(resolve, 350))

        if (shouldFail) {
          return new Response(
            JSON.stringify({ error: 'Internal Server Error' }),
            {
              status: 500,
              headers: { 'Content-Type': 'application/json' },
            },
          )
        }

        const body = (await request.json()) as {
          parentId: string | null
          body: string
        }

        const comment = createComment(body.body, body.parentId)

        return new Response(JSON.stringify(comment), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      },
    },
  },
})
