import type { Comment } from '../types'
import { CommentForm } from './CommentForm'

interface CommentTreeProps {
  comments: Comment[]
  parentId: string | null
  depth?: number
  replyTo: string | null
  onReply: (id: string | null) => void
  onSubmitReply: (body: string, parentId: string | null) => Promise<void>
}

export function CommentTree({
  comments,
  parentId,
  depth = 0,
  replyTo,
  onReply,
  onSubmitReply,
}: CommentTreeProps) {
  const children = comments.filter((c) => c.parentId === parentId)

  if (children.length === 0) return null

  return (
    <ul
      style={{
        listStyle: 'none',
        padding: 0,
        margin: 0,
        marginLeft: depth > 0 ? '1.5rem' : 0,
        borderLeft: depth > 0 ? '2px solid #e0e0e0' : 'none',
        paddingLeft: depth > 0 ? '1rem' : 0,
      }}
    >
      {children.map((comment) => (
        <li key={comment.id} style={{ marginBottom: '0.75rem' }}>
          <div
            style={{
              padding: '0.75rem',
              border: '1px solid #ddd',
              borderRadius: '6px',
              background: comment.id.startsWith('optimistic-')
                ? '#fffde7'
                : '#fff',
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: '0.95rem',
                lineHeight: '1.5',
              }}
            >
              {comment.body}
            </p>
            <div
              style={{
                marginTop: '0.5rem',
                display: 'flex',
                gap: '0.75rem',
                alignItems: 'center',
                fontSize: '0.8rem',
                color: '#888',
              }}
            >
              <span>
                {new Date(comment.createdAt).toLocaleString()}
              </span>
              {comment.id.startsWith('optimistic-') && (
                <span style={{ color: '#f0a500', fontWeight: 'bold' }}>
                  (optimistic)
                </span>
              )}
              <button
                type="button"
                onClick={() =>
                  onReply(replyTo === comment.id ? null : comment.id)
                }
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#0066cc',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  textDecoration: 'underline',
                }}
              >
                Reply
              </button>
            </div>

            {replyTo === comment.id && (
              <div style={{ marginTop: '0.5rem' }}>
                <CommentForm
                  onSubmit={async (body) => {
                    await onSubmitReply(body, comment.id)
                  }}
                  placeholder={`Reply to "${comment.body.slice(0, 30)}${comment.body.length > 30 ? '...' : ''}"`}
                  label="Post Reply"
                />
              </div>
            )}
          </div>

          {/* Recursively render children */}
          <CommentTree
            comments={comments}
            parentId={comment.id}
            depth={depth + 1}
            replyTo={replyTo}
            onReply={onReply}
            onSubmitReply={onSubmitReply}
          />
        </li>
      ))}
    </ul>
  )
}
