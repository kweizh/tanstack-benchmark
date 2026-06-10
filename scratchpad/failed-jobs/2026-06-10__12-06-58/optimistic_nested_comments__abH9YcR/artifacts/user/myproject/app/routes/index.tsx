import { createFileRoute } from "@tanstack/react-router";
import {
  useQuery,
  useMutation,
  useQueryClient,
  queryOptions,
} from "@tanstack/react-query";
import { useState, useCallback } from "react";

// ---------------------------------------------------------------------------
// Data model
// ---------------------------------------------------------------------------
export interface Comment {
  id: string;
  parentId: string | null;
  body: string;
  createdAt: number;
  _optimistic?: boolean;
}

// ---------------------------------------------------------------------------
// Query / mutation helpers
// ---------------------------------------------------------------------------
const COMMENTS_KEY = ["comments"] as const;

async function fetchComments(): Promise<Comment[]> {
  const res = await fetch("/api/comments");
  if (!res.ok) throw new Error("Failed to fetch comments");
  return res.json();
}

async function postComment(payload: {
  parentId: string | null;
  body: string;
  fail?: boolean;
}): Promise<Comment> {
  const url = payload.fail ? "/api/comments?fail=1" : "/api/comments";
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ parentId: payload.parentId, body: payload.body }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(err.error ?? "Server error");
  }
  return res.json();
}

export const commentsQueryOptions = queryOptions({
  queryKey: COMMENTS_KEY,
  queryFn: fetchComments,
  staleTime: 0,
});

// ---------------------------------------------------------------------------
// Route definition with server-side prefetch
// ---------------------------------------------------------------------------
export const Route = createFileRoute("/")({
  loader: async ({ context: { queryClient } }) => {
    await queryClient.prefetchQuery(commentsQueryOptions);
  },
  component: HomePage,
});

// ---------------------------------------------------------------------------
// Recursive comment component
// ---------------------------------------------------------------------------
interface CommentNodeProps {
  comment: Comment;
  allComments: Comment[];
  depth: number;
  onReply: (parentId: string) => void;
}

function CommentNode({ comment, allComments, depth, onReply }: CommentNodeProps) {
  const children = allComments.filter((c) => c.parentId === comment.id);
  const date = new Date(comment.createdAt).toLocaleString();

  return (
    <div
      className={[
        "comment",
        comment._optimistic ? "comment--optimistic" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      data-comment-id={comment.id}
    >
      <div className="comment__meta">
        {comment._optimistic ? "⏳ Posting…" : `#${comment.id} · ${date}`}
      </div>
      <div className="comment__body">{comment.body}</div>
      {!comment._optimistic && (
        <button className="reply-btn" onClick={() => onReply(comment.id)}>
          ↳ Reply
        </button>
      )}
      {children.length > 0 && (
        <div className="comment__children">
          {children.map((child) => (
            <CommentNode
              key={child.id}
              comment={child}
              allComments={allComments}
              depth={depth + 1}
              onReply={onReply}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface CommentThreadProps {
  comments: Comment[];
  onReply: (parentId: string) => void;
}

function CommentThread({ comments, onReply }: CommentThreadProps) {
  const roots = comments.filter((c) => c.parentId === null);
  if (roots.length === 0) {
    return <p style={{ color: "#888", marginBottom: "1rem" }}>No comments yet. Be the first!</p>;
  }
  return (
    <div>
      {roots.map((root) => (
        <CommentNode
          key={root.id}
          comment={root}
          allComments={comments}
          depth={0}
          onReply={onReply}
        />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Post form component
// ---------------------------------------------------------------------------
interface PostFormProps {
  parentId: string | null;
  onCancel?: () => void;
  label?: string;
}

function PostForm({ parentId, onCancel, label = "Post Comment" }: PostFormProps) {
  const queryClient = useQueryClient();
  const [body, setBody] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [statusMsg, setStatusMsg] = useState("");

  const mutation = useMutation({
    mutationFn: postComment,

    // -----------------------------------------------------------------------
    // Optimistic update: insert the comment before server responds
    // -----------------------------------------------------------------------
    onMutate: async (variables) => {
      // Cancel any in-flight refetches so they don't overwrite our optimistic data
      await queryClient.cancelQueries({ queryKey: COMMENTS_KEY });

      // Snapshot the current cache so we can roll back on error
      const snapshot = queryClient.getQueryData<Comment[]>(COMMENTS_KEY);

      // Build an optimistic comment with a temporary id
      const optimistic: Comment = {
        id: `optimistic-${Date.now()}`,
        parentId: variables.parentId,
        body: variables.body,
        createdAt: Date.now(),
        _optimistic: true,
      };

      // Apply the optimistic insert
      queryClient.setQueryData<Comment[]>(COMMENTS_KEY, (old = []) => [
        ...old,
        optimistic,
      ]);

      // Return context with the snapshot for rollback
      return { snapshot };
    },

    // -----------------------------------------------------------------------
    // On error: roll back to the pre-mutation snapshot
    // -----------------------------------------------------------------------
    onError: (_error, _variables, context) => {
      if (context?.snapshot !== undefined) {
        queryClient.setQueryData<Comment[]>(COMMENTS_KEY, context.snapshot);
      }
      setStatus("error");
      setStatusMsg("Error: comment was not saved. Cache rolled back.");
    },

    // -----------------------------------------------------------------------
    // On success
    // -----------------------------------------------------------------------
    onSuccess: () => {
      setBody("");
      setStatus("success");
      setStatusMsg("Comment posted!");
      if (onCancel) {
        setTimeout(onCancel, 800);
      }
    },

    // -----------------------------------------------------------------------
    // On settle: re-sync with server regardless of outcome
    // -----------------------------------------------------------------------
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: COMMENTS_KEY });
    },
  });

  const handleSubmit = (e: React.FormEvent, fail = false) => {
    e.preventDefault();
    if (!body.trim()) return;
    setStatus("idle");
    mutation.mutate({ parentId, body: body.trim(), fail });
  };

  return (
    <form className="form" onSubmit={handleSubmit}>
      <label htmlFor={`body-${parentId ?? "root"}`}>
        {parentId ? `Replying to #${parentId}` : "New top-level comment"}
      </label>
      <textarea
        id={`body-${parentId ?? "root"}`}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Write your comment…"
        disabled={mutation.isPending}
      />
      <div className="form__actions">
        <button
          type="submit"
          className="btn btn--primary"
          disabled={mutation.isPending || !body.trim()}
        >
          {mutation.isPending ? "Posting…" : label}
        </button>
        <button
          type="button"
          className="btn btn--danger"
          disabled={mutation.isPending || !body.trim()}
          onClick={(e) => handleSubmit(e as unknown as React.FormEvent, true)}
          title="Submit with ?fail=1 to trigger server error and test rollback"
        >
          Post (Force Error)
        </button>
        {onCancel && (
          <button type="button" className="btn btn--ghost" onClick={onCancel}>
            Cancel
          </button>
        )}
        {status === "success" && (
          <span className="status status--success">{statusMsg}</span>
        )}
        {status === "error" && (
          <span className="status status--error">{statusMsg}</span>
        )}
        {mutation.isPending && (
          <span className="status status--pending">Sending… (optimistic preview shown above)</span>
        )}
      </div>
    </form>
  );
}

// ---------------------------------------------------------------------------
// Home page
// ---------------------------------------------------------------------------
function HomePage() {
  const { data: comments = [], isLoading, isError } = useQuery(commentsQueryOptions);
  const [replyTo, setReplyTo] = useState<string | null>(null);

  const handleReply = useCallback((parentId: string) => {
    setReplyTo(parentId);
  }, []);

  const handleCancelReply = useCallback(() => {
    setReplyTo(null);
  }, []);

  return (
    <div id="app">
      <h1>💬 Nested Comment Thread</h1>

      <PostForm parentId={null} label="Post Comment" />

      {replyTo && (
        <div style={{ marginBottom: "1.5rem" }}>
          <h2>Reply to #{replyTo}</h2>
          <PostForm
            parentId={replyTo}
            label="Post Reply"
            onCancel={handleCancelReply}
          />
        </div>
      )}

      <h2>Comments</h2>
      <p style={{ fontSize: "0.8rem", color: "#888", marginBottom: "1rem" }}>
        💡 Tip: Click <strong>Post (Force Error)</strong> to trigger a server 500 and watch the optimistic comment roll back.
      </p>

      {isLoading && <div className="loading">Loading comments…</div>}
      {isError && (
        <div className="error-box">Failed to load comments. Please refresh.</div>
      )}
      {!isLoading && !isError && (
        <CommentThread comments={comments} onReply={handleReply} />
      )}
    </div>
  );
}
