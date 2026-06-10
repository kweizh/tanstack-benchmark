import { createFileRoute } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import type { Post } from '../db'

export const Route = createFileRoute('/')({ component: App })

function App() {
  const queryClient = useQueryClient()
  const [simulateFailure, setSimulateFailure] = useState(false)

  // Fetch the posts
  const { data: posts, isLoading, error } = useQuery<Post[]>({
    queryKey: ['posts'],
    queryFn: async () => {
      const res = await fetch('/api/posts')
      if (!res.ok) {
        throw new Error('Failed to fetch posts')
      }
      return res.json()
    }
  })

  // Mutation for liking a post
  const { mutate, isPending } = useMutation<Post, Error, string, { previousPosts?: Post[] }>({
    mutationFn: async (postId: string) => {
      const res = await fetch(`/api/posts/${postId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fail: simulateFailure }),
      })
      if (!res.ok) {
        throw new Error('Failed to like post')
      }
      return res.json()
    },
    // Implement optimistic updates
    onMutate: async (postId) => {
      // Cancel any outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: ['posts'] })

      // Snapshot the previous value
      const previousPosts = queryClient.getQueryData<Post[]>(['posts'])

      // Optimistically update to the new value
      if (previousPosts) {
        queryClient.setQueryData<Post[]>(
          ['posts'],
          previousPosts.map((post) =>
            post.id === postId ? { ...post, likes: post.likes + 1 } : post
          )
        )
      }

      // Return a context object with the snapshotted value
      return { previousPosts }
    },
    // If the mutation fails, roll back
    onError: (err, postId, context) => {
      if (context?.previousPosts) {
        queryClient.setQueryData<Post[]>(['posts'], context.previousPosts)
      }
    },
    // Always refetch after error or success:
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] })
    },
  })

  if (isLoading) {
    return (
      <main className="page-wrap px-4 pb-8 pt-14 flex items-center justify-center min-h-[50vh]">
        <p className="text-lg text-[var(--sea-ink-soft)]">Loading post...</p>
      </main>
    )
  }

  if (error) {
    return (
      <main className="page-wrap px-4 pb-8 pt-14 flex items-center justify-center min-h-[50vh]">
        <p className="text-lg text-red-500">Error: {(error as Error).message}</p>
      </main>
    )
  }

  const post = posts?.[0]

  if (!post) {
    return (
      <main className="page-wrap px-4 pb-8 pt-14 flex items-center justify-center min-h-[50vh]">
        <p className="text-lg text-[var(--sea-ink-soft)]">No posts found.</p>
      </main>
    )
  }

  return (
    <main className="page-wrap px-4 pb-8 pt-14 max-w-xl mx-auto">
      <section className="island-shell rise-in relative overflow-hidden rounded-[2rem] px-6 py-10 sm:px-10 sm:py-14 shadow-lg border border-[rgba(50,143,151,0.15)] bg-white/80 backdrop-blur-md">
        <div className="pointer-events-none absolute -left-20 -top-24 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(79,184,178,0.2),transparent_66%)]" />
        
        <p className="island-kicker mb-3 text-sm font-semibold tracking-wider text-[var(--lagoon-deep)] uppercase">
          TanStack Query Optimistic Update
        </p>
        
        <h1 className="display-title mb-5 text-3xl font-bold tracking-tight text-[var(--sea-ink)] leading-tight">
          {post.title}
        </h1>

        <div className="flex items-center justify-between mt-8 p-4 rounded-xl bg-slate-50 border border-slate-100">
          <div className="flex flex-col">
            <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
              Likes
            </span>
            <span
              data-testid="like-count"
              className="text-3xl font-extrabold text-[var(--sea-ink)]"
            >
              {post.likes}
            </span>
          </div>

          <button
            data-testid="like-button"
            onClick={() => mutate(post.id)}
            disabled={isPending}
            className="flex items-center gap-2 rounded-full bg-[var(--lagoon-deep)] hover:bg-[var(--sea-ink)] text-white px-6 py-3 text-sm font-bold shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill={post.likes > 0 ? "currentColor" : "none"}
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5 transition-transform group-hover:scale-110"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
              />
            </svg>
            Like Post
          </button>
        </div>

        <div className="mt-6 flex items-center gap-3 p-3 rounded-xl bg-red-50/50 border border-red-100">
          <input
            id="simulate-failure"
            type="checkbox"
            data-testid="simulate-failure"
            checked={simulateFailure}
            onChange={(e) => setSimulateFailure(e.target.checked)}
            className="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500 focus:ring-2 cursor-pointer"
          />
          <label
            htmlFor="simulate-failure"
            className="text-sm font-medium text-red-700 cursor-pointer select-none"
          >
            Simulate Server Failure (500 Error)
          </label>
        </div>
      </section>
    </main>
  )
}
