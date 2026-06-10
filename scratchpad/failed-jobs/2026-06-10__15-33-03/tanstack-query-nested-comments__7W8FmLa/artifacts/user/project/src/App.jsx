import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Fetch comments from the API
async function fetchComments() {
  const response = await fetch('/api/comments');
  if (!response.ok) {
    throw new Error('Failed to fetch comments');
  }
  return response.json();
}

// Post a new comment to the API
async function postComment(newComment) {
  const response = await fetch('/api/comments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newComment),
  });
  if (!response.ok) {
    throw new Error('Failed to post comment');
  }
  return response.json();
}

// Build a nested tree structure from flat comments
function buildCommentTree(comments) {
  if (!comments) return [];
  const map = {};
  const roots = [];

  comments.forEach((comment) => {
    map[comment.id] = { ...comment, children: [] };
  });

  comments.forEach((comment) => {
    if (comment.parentId && map[comment.parentId]) {
      map[comment.parentId].children.push(map[comment.id]);
    } else {
      roots.push(map[comment.id]);
    }
  });

  return roots;
}

// Recursive component to render a comment and its replies
function CommentItem({ comment, depth = 0 }) {
  return (
    <div style={{ marginLeft: depth * 24, marginBottom: '8px' }}>
      <div
        style={{
          padding: '8px 12px',
          backgroundColor: '#f5f5f5',
          borderRadius: '6px',
          border: '1px solid #ddd',
        }}
      >
        <span style={{ color: '#666', fontSize: '0.85em' }}>#{comment.id}</span>
        <span style={{ marginLeft: '8px' }}>{comment.text}</span>
      </div>
      {comment.children && comment.children.length > 0 && (
        <div style={{ marginTop: '4px' }}>
          {comment.children.map((child) => (
            <CommentItem key={child.id} comment={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function App() {
  const queryClient = useQueryClient();
  const [commentText, setCommentText] = useState('');

  // Fetch comments using TanStack Query
  const { data: comments = [], isLoading, error } = useQuery({
    queryKey: ['comments'],
    queryFn: fetchComments,
  });

  // Mutation with optimistic update
  const mutation = useMutation({
    mutationFn: postComment,
    onMutate: async (newComment) => {
      // Cancel any outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: ['comments'] });

      // Snapshot the previous value
      const previousComments = queryClient.getQueryData(['comments']);

      // Optimistically update to the new value
      const optimisticComment = {
        id: 'optimistic-' + Date.now(),
        text: newComment.text,
        parentId: newComment.parentId || null,
      };

      queryClient.setQueryData(['comments'], (old) => [
        ...(old || []),
        optimisticComment,
      ]);

      // Return context with the snapshot for rollback
      return { previousComments };
    },
    onError: (err, newComment, context) => {
      // Roll back to the previous comments on error
      if (context?.previousComments) {
        queryClient.setQueryData(['comments'], context.previousComments);
      }
    },
    onSettled: () => {
      // Invalidate the query to ensure we're in sync with the server
      queryClient.invalidateQueries({ queryKey: ['comments'] });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const text = commentText.trim();
    if (!text) return;

    mutation.mutate({ text, parentId: null });
    setCommentText('');
  };

  const commentTree = buildCommentTree(comments);

  return (
    <div style={{ maxWidth: '700px', margin: '40px auto', fontFamily: 'sans-serif' }}>
      <h1>Nested Comments</h1>
      <p style={{ color: '#888', fontSize: '0.9em' }}>
        Optimistic updates with TanStack Query — new comments appear instantly before the server responds.
      </p>

      {/* Comment Form */}
      <form onSubmit={handleSubmit} style={{ marginBottom: '24px', display: 'flex', gap: '8px' }}>
        <input
          id="commentText"
          name="commentText"
          type="text"
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder="Write a comment..."
          style={{ flex: 1, padding: '8px 12px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
        <button
          id="submitComment"
          type="submit"
          disabled={mutation.isPending}
          style={{
            padding: '8px 16px',
            borderRadius: '4px',
            border: 'none',
            backgroundColor: '#007bff',
            color: 'white',
            cursor: mutation.isPending ? 'not-allowed' : 'pointer',
          }}
        >
          {mutation.isPending ? 'Submitting...' : 'Submit'}
        </button>
      </form>

      {mutation.isPending && (
        <p style={{ color: '#007bff', fontSize: '0.85em', fontStyle: 'italic' }}>
          ⏳ Optimistic update in progress — waiting for server response...
        </p>
      )}

      {/* Comments List */}
      {isLoading && <p>Loading comments...</p>}
      {error && <p style={{ color: 'red' }}>Error: {error.message}</p>}
      {commentTree.length > 0 ? (
        commentTree.map((comment) => (
          <CommentItem key={comment.id} comment={comment} />
        ))
      ) : (
        !isLoading && <p>No comments yet. Be the first!</p>
      )}
    </div>
  );
}