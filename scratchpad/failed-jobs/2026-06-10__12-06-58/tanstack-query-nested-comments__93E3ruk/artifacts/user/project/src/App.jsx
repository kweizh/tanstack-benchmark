import { useRef, useState } from 'react';
import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';

// ─── API helpers ──────────────────────────────────────────────────────────────

const QUERY_KEY = ['comments'];

async function fetchComments() {
  const res = await fetch('/api/comments');
  if (!res.ok) throw new Error('Failed to fetch comments');
  return res.json();
}

async function postComment({ text, parentId = null }) {
  const res = await fetch('/api/comments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, parentId }),
  });
  if (!res.ok) throw new Error('Failed to add comment');
  return res.json();
}

// ─── Comment components ───────────────────────────────────────────────────────

function Reply({ reply }) {
  const isOptimistic = reply._optimistic === true;
  return (
    <div className={`reply-item${isOptimistic ? ' optimistic' : ''}`}>
      <div className="reply-line" />
      <div className="reply-content">
        <div className="reply-meta">
          <span className="reply-id">#{reply.id.slice(0, 8)}</span>
          {isOptimistic && (
            <span className="optimistic-tag">
              <span className="spinner" style={{ width: 8, height: 8, borderWidth: 1.5 }} />
              pending
            </span>
          )}
        </div>
        <p className="reply-text">{reply.text}</p>
      </div>
    </div>
  );
}

function Comment({ comment, replies }) {
  const isOptimistic = comment._optimistic === true;
  return (
    <div className={`comment-item${isOptimistic ? ' optimistic' : ''}`}>
      <div className="comment-body">
        <div className="comment-meta">
          <span className="comment-id">#{comment.id.slice(0, 8)}</span>
          {isOptimistic && (
            <span className="optimistic-tag">
              <span className="spinner" style={{ width: 8, height: 8, borderWidth: 1.5 }} />
              pending
            </span>
          )}
        </div>
        <p className="comment-text">{comment.text}</p>
      </div>
      {replies.length > 0 && (
        <div className="comment-replies">
          {replies.map((r) => (
            <Reply key={r.id} reply={r} />
          ))}
        </div>
      )}
    </div>
  );
}

// Build a tree: top-level comments with their replies
function CommentThread({ comments }) {
  const topLevel = comments.filter((c) => c.parentId === null);
  const byParent = comments.reduce((acc, c) => {
    if (c.parentId) {
      acc[c.parentId] = acc[c.parentId] || [];
      acc[c.parentId].push(c);
    }
    return acc;
  }, {});

  if (topLevel.length === 0) {
    return (
      <div className="empty-state">No comments yet. Be the first!</div>
    );
  }

  return (
    <div className="comment-thread">
      {topLevel.map((c) => (
        <Comment
          key={c.id}
          comment={c}
          replies={byParent[c.id] || []}
        />
      ))}
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────

export default function App() {
  const queryClient = useQueryClient();
  const inputRef = useRef(null);
  const [mutationStatus, setMutationStatus] = useState(null); // 'pending' | 'success' | 'error'

  // ── Fetch comments ──────────────────────────────────────────────────────────
  const {
    data: comments = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: fetchComments,
  });

  // ── Add comment mutation with full optimistic update lifecycle ───────────────
  const mutation = useMutation({
    mutationFn: postComment,

    // 1. Optimistically insert the new comment BEFORE the request completes
    onMutate: async (newComment) => {
      setMutationStatus('pending');

      // Cancel any in-flight refetches so they don't overwrite our optimistic data
      await queryClient.cancelQueries({ queryKey: QUERY_KEY });

      // Snapshot the current cache for rollback on error
      const previousComments = queryClient.getQueryData(QUERY_KEY);

      // Build the optimistic comment with a temporary id
      const optimisticComment = {
        id: `optimistic-${Date.now()}`,
        text: newComment.text,
        parentId: newComment.parentId ?? null,
        _optimistic: true,
      };

      // Inject the optimistic comment at the top of the list
      queryClient.setQueryData(QUERY_KEY, (old = []) => [
        optimisticComment,
        ...old,
      ]);

      // Return context so onError can roll back
      return { previousComments };
    },

    // 2. Roll back the cache if the mutation fails
    onError: (_err, _newComment, context) => {
      setMutationStatus('error');
      if (context?.previousComments) {
        queryClient.setQueryData(QUERY_KEY, context.previousComments);
      }
    },

    // 3. Always re-sync with the server after success or failure
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },

    onSuccess: () => {
      setMutationStatus('success');
      setTimeout(() => setMutationStatus(null), 2500);
    },
  });

  // ── Form submit ─────────────────────────────────────────────────────────────
  const handleSubmit = (e) => {
    e.preventDefault();
    const text = inputRef.current?.value?.trim();
    if (!text) return;
    mutation.mutate({ text, parentId: null });
    inputRef.current.value = '';
  };

  // ── Status message ──────────────────────────────────────────────────────────
  const renderStatus = () => {
    if (mutationStatus === 'pending') {
      return (
        <div className="status-bar pending">
          <span className="spinner" />
          Comment shown optimistically — waiting for server (1 s delay)…
        </div>
      );
    }
    if (mutationStatus === 'success') {
      return (
        <div className="status-bar success">
          ✓ Server confirmed — comment persisted
        </div>
      );
    }
    if (mutationStatus === 'error') {
      return (
        <div className="status-bar error">
          ✗ Server error — optimistic update rolled back
        </div>
      );
    }
    return <div className="status-bar" />;
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div>
      <header className="header">
        <h1>Nested Comments</h1>
        <p>Powered by TanStack Query optimistic updates</p>
        <span className="badge">⚡ Optimistic Updates Demo</span>
      </header>

      {/* Add comment form */}
      <div className="add-comment-card">
        <h2>Add a comment</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <input
              ref={inputRef}
              id="commentText"
              name="commentText"
              type="text"
              placeholder="Write something…"
              autoComplete="off"
              disabled={mutation.isPending}
            />
            <button
              id="submitComment"
              type="submit"
              className="btn-submit"
              disabled={mutation.isPending}
            >
              Submit
            </button>
          </div>
          {renderStatus()}
        </form>
      </div>

      {/* Comments list */}
      <section className="comments-section">
        <h2>Comments ({comments.length})</h2>

        {isLoading && (
          <div className="loading-state">
            <span className="spinner" style={{ marginRight: '0.5rem' }} />
            Loading comments…
          </div>
        )}

        {isError && (
          <div className="error-state">
            Failed to load comments: {error.message}
          </div>
        )}

        {!isLoading && !isError && (
          <CommentThread comments={comments} />
        )}
      </section>
    </div>
  );
}
