import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useComments, useCreateComment } from '../hooks/useComments'
import { CommentTree } from '../components/CommentTree'
import { CommentForm } from '../components/CommentForm'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  const { data: comments = [], isLoading, error } = useComments()
  const createComment = useCreateComment()
  const queryClient = useQueryClient()
  const [replyTo, setReplyTo] = useState<string | null>(null)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)

  const handleCreateComment = async (body: string, parentId: string | null) => {
    setStatusMessage(null)
    try {
      await createComment.mutateAsync({ body, parentId })
      setReplyTo(null)
    } catch {
      setStatusMessage('Error: Failed to create comment (server returned an error)')
    }
  }

  const handleCreateFailingComment = async (
    body: string,
    parentId: string | null,
  ) => {
    setStatusMessage(null)
    try {
      await createComment.mutateAsync({ body, parentId, fail: true })
    } catch {
      setStatusMessage('Error: Failed to create comment (server returned an error)')
    }
  }

  if (isLoading) {
    return (
      <div style={{ padding: '1rem', fontFamily: 'sans-serif' }}>
        <h1>Comment Thread</h1>
        <p>Loading comments...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ padding: '1rem', fontFamily: 'sans-serif' }}>
        <h1>Comment Thread</h1>
        <p style={{ color: 'red' }}>Error loading comments.</p>
      </div>
    )
  }

  return (
    <div style={{ padding: '1rem', fontFamily: 'sans-serif', maxWidth: '700px', margin: '0 auto' }}>
      <h1>Comment Thread</h1>

      {statusMessage && (
        <p style={{ color: 'red', fontWeight: 'bold' }}>{statusMessage}</p>
      )}

      <CommentForm
        onSubmit={(body) => handleCreateComment(body, null)}
        placeholder="Write a top-level comment..."
        label="Post Comment"
      />

      <div style={{ marginTop: '1rem' }}>
        <button
          type="button"
          onClick={async () => {
            setStatusMessage(null)
            try {
              await createComment.mutateAsync({
                body: 'This comment will fail!',
                parentId: null,
                fail: true,
              })
            } catch {
              setStatusMessage(
                'Error: Failed to create comment (server returned an error)',
              )
            }
          }}
          style={{
            padding: '0.5rem 1rem',
            background: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '0.9rem',
          }}
        >
          Test Error Path (POST with fail=1)
        </button>
      </div>

      <div style={{ marginTop: '1.5rem' }}>
        {comments.length === 0 ? (
          <p style={{ color: '#666' }}>No comments yet. Be the first!</p>
        ) : (
          <CommentTree
            comments={comments}
            parentId={null}
            replyTo={replyTo}
            onReply={setReplyTo}
            onSubmitReply={handleCreateComment}
          />
        )}
      </div>
    </div>
  )
}
