import { json } from '@tanstack/react-start'
import { createAPIFileRoute } from '@tanstack/react-start/api'

export const Route = createAPIFileRoute('/api/comments')({
  GET: ({ request }) => {
    return json({ hello: 'world' })
  }
})
