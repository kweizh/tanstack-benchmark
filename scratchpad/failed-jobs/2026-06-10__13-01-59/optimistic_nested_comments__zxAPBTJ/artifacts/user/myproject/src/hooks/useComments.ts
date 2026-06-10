import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Comment } from '../types'

const COMMENTS_QUERY_KEY = ['comments'] as const

async function fetchComments(): Promise<Comment[]> {
  const res = await fetch('/api/comments')
  if (!res.ok) {
    throw new Error('Failed to fetch comments')
  }
  return res.json()
}

async function postComment({
  body,
  parentId,
  fail,
}: {
  body: string
  parentId: string | null
  fail?: boolean
}): Promise<Comment> {
  const url = fail ? '/api/comments?fail=1' : '/api/comments'
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ body, parentId }),
  })
  if (!res.ok) {
    throw new Error('Failed to create comment')
  }
  return res.json()
}

export function useComments() {
  return useQuery({
    queryKey: COMMENTS_QUERY_KEY,
    queryFn: fetchComments,
    staleTime: 0,
  })
}

export function useCreateComment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: postComment,

    onMutate: async (newComment) => {
      // Cancel any in-flight queries for comments
      await queryClient.cancelQueries({ queryKey: COMMENTS_QUERY_KEY })

      // Snapshot the current cache
      const previousComments = queryClient.getQueryData<Comment[]>(
        COMMENTS_QUERY_KEY,
      )

      // Optimistically insert the new comment into the cache
      if (previousComments) {
        const optimisticComment: Comment = {
          id: `optimistic-${Date.now()}-${Math.random().toString(36).slice(2)}`,
          parentId: newComment.parentId,
          body: newComment.body,
          createdAt: Date.now(),
        }

        queryClient.setQueryData<Comment[]>(COMMENTS_QUERY_KEY, [
          ...previousComments,
          optimisticComment,
        ])
      }

      // Return the snapshot for rollback
      return { previousComments }
    },

    onError: (_error, _newComment, context) => {
      // Roll back to the pre-mutation snapshot
      if (context?.previousComments) {
        queryClient.setQueryData<Comment[]>(
          COMMENTS_QUERY_KEY,
          context.previousComments,
        )
      }
    },

    onSettled: () => {
      // Invalidate to re-sync with the server
      queryClient.invalidateQueries({ queryKey: COMMENTS_QUERY_KEY })
    },
  })
}
