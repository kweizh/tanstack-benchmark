import { createFileRoute } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'

export const Route = createFileRoute('/')({ component: App })

function App() {
  const [simulateFailure, setSimulateFailure] = useState(false)
  const queryClient = useQueryClient()

  const { data: posts, isLoading } = useQuery({
    queryKey: ['posts'],
    queryFn: async () => {
      const res = await fetch('/api/posts')
      return res.json()
    },
  })

  const mutation = useMutation({
    mutationFn: async ({ id, fail }: { id: string; fail: boolean }) => {
      const res = await fetch(`/api/posts/${id}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fail }),
      })
      if (!res.ok) {
        throw new Error('Failed to like post')
      }
      return res.json()
    },
    onMutate: async ({ id }) => {
      await queryClient.cancelQueries({ queryKey: ['posts'] })
      const previousPosts = queryClient.getQueryData(['posts'])

      queryClient.setQueryData(['posts'], (old: any) => {
        if (!old) return old
        return old.map((post: any) =>
          post.id === id ? { ...post, likes: post.likes + 1 } : post
        )
      })

      return { previousPosts }
    },
    onError: (_err, _variables, context) => {
      if (context?.previousPosts) {
        queryClient.setQueryData(['posts'], context.previousPosts)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] })
    },
  })

  if (isLoading) return <div>Loading...</div>

  const post = posts?.[0]

  if (!post) return <div>No posts found</div>

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4">{post.title}</h1>
      <div className="mb-4">
        Likes: <span data-testid="like-count">{post.likes}</span>
      </div>
      <div className="flex items-center gap-4 mb-4">
        <button
          data-testid="like-button"
          onClick={() => mutation.mutate({ id: post.id, fail: simulateFailure })}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Like
        </button>
      </div>
      <div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            data-testid="simulate-failure"
            checked={simulateFailure}
            onChange={(e) => setSimulateFailure(e.target.checked)}
          />
          Simulate Failure
        </label>
      </div>
    </main>
  )
}
