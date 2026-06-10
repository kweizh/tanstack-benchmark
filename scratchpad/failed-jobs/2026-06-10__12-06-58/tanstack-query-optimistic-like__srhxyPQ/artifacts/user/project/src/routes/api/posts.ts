import { createFileRoute } from '@tanstack/react-router'
import { postsStore } from '../../store'

export const Route = createFileRoute('/api/posts')({
  server: {
    handlers: {
      GET: async () => {
        return Response.json(postsStore)
      },
    },
  },
})
