import { createFileRoute } from '@tanstack/react-router'
import { posts } from '../../db'

export const Route = createFileRoute('/api/posts')({
  server: {
    handlers: {
      GET: async () => {
        return Response.json(posts)
      }
    }
  }
})
