import React from 'react';

function buildTree(comments) {
  const map = {};
  const roots = [];

  for (const c of comments) {
    map[c.id] = { ...c, children: [] };
  }

  for (const c of comments) {
    if (c.parentId && map[c.parentId]) {
      map[c.parentId].children.push(map[c.id]);
    } else {
      roots.push(map[c.id]);
    }
  }

  return roots;
}

function CommentItem({ comment }) {
  return (
    <div className={`comment-item${comment._optimistic ? ' optimistic' : ''}`}>
      <div className="comment-text">{comment.text}</div>
      {comment.children && comment.children.length > 0 && (
        <div className="comment-children">
          {comment.children.map((child) => (
            <CommentItem key={child.id} comment={child} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function CommentList({ comments, isLoading, isError, error }) {
  if (isLoading) {
    return <div className="status-message">Loading comments...</div>;
  }

  if (isError) {
    return (
      <div className="status-message error">
        Error: {error?.message || 'Something went wrong'}
      </div>
    );
  }

  const tree = buildTree(comments || []);

  if (tree.length === 0) {
    return <div className="status-message">No comments yet. Be the first!</div>;
  }

  return (
    <div className="comment-list">
      {tree.map((comment) => (
        <CommentItem key={comment.id} comment={comment} />
      ))}
    </div>
  );
}
