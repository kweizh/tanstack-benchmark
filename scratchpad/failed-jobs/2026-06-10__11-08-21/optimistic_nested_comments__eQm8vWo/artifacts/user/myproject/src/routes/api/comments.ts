import { createAPIFileRoute } from '@tanstack/react-start/api'

interface Comment {
  id: string
  parentId: string | null
  body: string
  createdAt: number
}

// Global in-memory comments store
const comments: Comment[] = [
  {
    id: '1',
    parentId: null,
    body: 'Welcome to the nested comment thread!',
    createdAt: Date.now() - 100000,
  },
  {
    id: '2',
    parentId: '1',
    body: 'This is a child reply.',
    createdAt: Date.now() - 50000,
  },
]

export const APIRoute = createAPIFileRoute('/api/comments')({
  GET: async ({ request }) => {
    return Response.json(comments)
  },
  POST: async ({ request }) => {
    const url = new URL(request.url)
    const fail = url.searchParams.get('fail')

    const body = await request.json()

    if (fail === '1') {
      return new Response(JSON.stringify({ error: 'Forced server error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Artificially delay response by at least 300ms
    await new Promise((resolve) => setTimeout(resolve, 350))

    const newComment: Comment = {
      id: Math.random().toString(36).substring(2, 9),
      parentId: body.parentId || null,
      body: body.body || '',
      createdAt: Date.now(),
    }

    comments.push(newComment)

    return Response.json(newComment)
  },
})
