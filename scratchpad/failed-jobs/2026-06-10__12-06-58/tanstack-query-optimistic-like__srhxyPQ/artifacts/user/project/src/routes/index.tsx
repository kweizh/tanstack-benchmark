import { createFileRoute } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'

export const Route = createFileRoute('/')({
  component: Home,
})

interface Post {
  id: string
  title: string
  likes: number
}

async function fetchPosts(): Promise<Post[]> {
  const res = await fetch('/api/posts')
  if (!res.ok) throw new Error('Failed to fetch posts')
  return res.json()
}

async function likePost(args: { id: string; fail: boolean }): Promise<Post> {
  const res = await fetch(`/api/posts/${args.id}/like`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fail: args.fail }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as { error?: string }).error ?? 'Failed to like post')
  }
  return res.json()
}

function PostCard({ post }: { post: Post }) {
  const queryClient = useQueryClient()
  const [simulateFailure, setSimulateFailure] = useState(false)

  const mutation = useMutation({
    mutationFn: likePost,

    // Step 1: Optimistically update before request completes
    onMutate: async ({ id }) => {
      // Cancel any outgoing refetches so they don't overwrite the optimistic update
      await queryClient.cancelQueries({ queryKey: ['posts'] })

      // Snapshot the previous value for rollback
      const previousPosts = queryClient.getQueryData<Post[]>(['posts'])

      // Optimistically update to the new value immediately
      queryClient.setQueryData<Post[]>(['posts'], (old) =>
        old?.map((p) => (p.id === id ? { ...p, likes: p.likes + 1 } : p)),
      )

      return { previousPosts }
    },

    // Step 2: Roll back on error
    onError: (_err, _variables, context) => {
      if (context?.previousPosts) {
        queryClient.setQueryData<Post[]>(['posts'], context.previousPosts)
      }
    },

    // Step 3: Always resync with server after mutation
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] })
    },
  })

  return (
    <div
      style={{
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        padding: '24px',
        maxWidth: '420px',
        margin: '20px auto',
        fontFamily: 'system-ui, sans-serif',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      }}
    >
      <h2 style={{ marginTop: 0, fontSize: '20px', color: '#1e293b' }}>
        {post.title}
      </h2>

      <p style={{ color: '#64748b', marginBottom: '20px' }}>
        Likes:{' '}
        <strong
          data-testid="like-count"
          style={{ color: '#1e293b', fontSize: '18px' }}
        >
          {post.likes}
        </strong>
      </p>

      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <button
          data-testid="like-button"
          onClick={() =>
            mutation.mutate({ id: post.id, fail: simulateFailure })
          }
          disabled={mutation.isPending}
          style={{
            padding: '10px 24px',
            backgroundColor: mutation.isPending ? '#94a3b8' : '#4f46e5',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: mutation.isPending ? 'not-allowed' : 'pointer',
            fontSize: '15px',
            fontWeight: '600',
            transition: 'background-color 0.2s',
          }}
        >
          {mutation.isPending ? 'Liking…' : '👍 Like'}
        </button>

        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            color: '#475569',
            fontSize: '14px',
          }}
        >
          <input
            type="checkbox"
            data-testid="simulate-failure"
            checked={simulateFailure}
            onChange={(e) => setSimulateFailure(e.target.checked)}
            style={{ width: '16px', height: '16px', cursor: 'pointer' }}
          />
          Simulate Failure
        </label>
      </div>

      {mutation.isError && (
        <p
          style={{
            color: '#dc2626',
            marginTop: '16px',
            fontSize: '14px',
            padding: '10px 14px',
            backgroundColor: '#fef2f2',
            borderRadius: '6px',
            border: '1px solid #fca5a5',
          }}
        >
          ⚠️ {(mutation.error as Error).message} — like count rolled back.
        </p>
      )}

      {mutation.isSuccess && (
        <p
          style={{
            color: '#16a34a',
            marginTop: '16px',
            fontSize: '14px',
            padding: '10px 14px',
            backgroundColor: '#f0fdf4',
            borderRadius: '6px',
            border: '1px solid #86efac',
          }}
        >
          ✅ Like saved successfully!
        </p>
      )}
    </div>
  )
}

function Home() {
  const {
    data: posts,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['posts'],
    queryFn: fetchPosts,
  })

  if (isLoading)
    return (
      <p style={{ fontFamily: 'system-ui, sans-serif', padding: '20px' }}>
        Loading posts…
      </p>
    )
  if (isError)
    return (
      <p
        style={{
          fontFamily: 'system-ui, sans-serif',
          padding: '20px',
          color: 'red',
        }}
      >
        Failed to load posts.
      </p>
    )

  return (
    <div style={{ padding: '20px' }}>
      <h1
        style={{
          textAlign: 'center',
          fontFamily: 'system-ui, sans-serif',
          color: '#1e293b',
        }}
      >
        TanStack Query — Optimistic Likes
      </h1>
      {posts?.map((post) => <PostCard key={post.id} post={post} />)}
    </div>
  )
}
