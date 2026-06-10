import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Fetch comments from the server
async function fetchComments() {
  const response = await fetch('/api/comments');
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
}

// Post a new comment to the server
async function postComment(newComment) {
  const response = await fetch('/api/comments', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(newComment),
  });
  if (!response.ok) {
    throw new Error('Failed to post comment');
  }
  return response.json();
}

export default function App() {
  const queryClient = useQueryClient();
  const [commentText, setCommentText] = useState('');
  const [parentId, setParentId] = useState(null);

  // Fetch comments query
  const { data: comments = [], isLoading, isError, error } = useQuery({
    queryKey: ['comments'],
    queryFn: fetchComments,
  });

  // Mutation with optimistic updates
  const mutation = useMutation({
    mutationFn: postComment,
    // When mutate is called:
    onMutate: async (newComment) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: ['comments'] });

      // Snapshot the previous value
      const previousComments = queryClient.getQueryData(['comments']);

      // Generate a temporary unique ID for immediate rendering
      const tempId = `temp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

      // Optimistically update to the new value
      queryClient.setQueryData(['comments'], (old) => [
        ...(old || []),
        {
          id: tempId,
          text: newComment.text,
          parentId: newComment.parentId || null,
          isOptimistic: true, // flag to show visual indicator
        },
      ]);

      // Return a context object with the snapshotted value and tempId
      return { previousComments, tempId };
    },
    // If the mutation fails, use the context returned from onMutate to roll back
    onError: (err, newComment, context) => {
      if (context?.previousComments) {
        queryClient.setQueryData(['comments'], context.previousComments);
      }
    },
    // Always refetch or update state after success or error
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['comments'] });
    },
  });

  // Group comments by their parentId to build the nested tree structure
  const commentsByParentId = useMemo(() => {
    const map = {};
    comments.forEach((comment) => {
      const key = comment.parentId || 'root';
      if (!map[key]) {
        map[key] = [];
      }
      map[key].push(comment);
    });
    return map;
  }, [comments]);

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    const text = commentText.trim();
    if (!text) return;

    // Trigger mutation
    mutation.mutate({
      text,
      parentId,
    });

    // Reset input fields immediately
    setCommentText('');
    setParentId(null);
  };

  // Find the text of the comment being replied to
  const replyTargetText = useMemo(() => {
    if (!parentId) return '';
    const target = comments.find((c) => c.id === parentId);
    return target ? target.text : '';
  }, [parentId, comments]);

  // Recursive component to render nested comments
  const renderCommentTree = (parentIdKey = 'root') => {
    const currentLevelComments = commentsByParentId[parentIdKey] || [];
    if (currentLevelComments.length === 0) return null;

    return (
      <div className={parentIdKey === 'root' ? 'comments-root' : 'nested-comments'}>
        {currentLevelComments.map((comment) => (
          <div
            key={comment.id}
            className={`comment-card ${comment.isOptimistic ? 'optimistic' : ''}`}
          >
            <p className="comment-text">{comment.text}</p>
            <div className="comment-meta">
              {comment.isOptimistic && (
                <span className="comment-status">Sending...</span>
              )}
              <button
                type="button"
                className="reply-btn"
                onClick={() => setParentId(comment.id)}
              >
                Reply
              </button>
            </div>
            {/* Recursively render child comments */}
            {renderCommentTree(comment.id)}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="app-container">
      <h1>Optimistic Comments Thread</h1>

      <div className="comments-list">
        {isLoading && <div className="loading">Loading comments...</div>}
        {isError && (
          <div className="error">
            Error loading comments: {error.message || 'Unknown error'}
          </div>
        )}
        {!isLoading && !isError && comments.length === 0 && (
          <p style={{ textAlign: 'center', color: '#6b7280' }}>
            No comments yet. Be the first to comment!
          </p>
        )}
        {!isLoading && !isError && renderCommentTree('root')}
      </div>

      <div className="form-container">
        <form onSubmit={handleSubmit}>
          {parentId && (
            <div className="replying-indicator">
              <span>
                Replying to: <strong>"{replyTargetText.substring(0, 40)}{replyTargetText.length > 40 ? '...' : ''}"</strong>
              </span>
              <button
                type="button"
                className="cancel-reply-btn"
                onClick={() => setParentId(null)}
              >
                Cancel Reply
              </button>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="commentText" className="form-label">
              {parentId ? 'Your Reply' : 'Add a New Comment'}
            </label>
            <textarea
              id="commentText"
              name="commentText"
              className="comment-input"
              placeholder={parentId ? 'Write a reply...' : 'Write a comment...'}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              required
            />
            <button
              type="submit"
              id="submitComment"
              className="submit-btn"
              disabled={!commentText.trim()}
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
