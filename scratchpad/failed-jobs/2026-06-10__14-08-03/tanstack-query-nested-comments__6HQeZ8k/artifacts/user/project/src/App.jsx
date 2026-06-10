import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const fetchComments = async () => {
  const res = await fetch('/api/comments');
  if (!res.ok) throw new Error('Network response was not ok');
  return res.json();
};

const postComment = async (newComment) => {
  const res = await fetch('/api/comments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newComment),
  });
  if (!res.ok) throw new Error('Network response was not ok');
  return res.json();
};

function CommentList({ comments, parentId }) {
  const childComments = comments.filter((c) => c.parentId === parentId);

  if (childComments.length === 0) return null;

  return (
    <ul style={{ marginLeft: parentId ? '20px' : '0px' }}>
      {childComments.map((comment) => (
        <li key={comment.id}>
          {comment.text}
          <CommentForm parentId={comment.id} />
          <CommentList comments={comments} parentId={comment.id} />
        </li>
      ))}
    </ul>
  );
}

function CommentForm({ parentId = null }) {
  const [text, setText] = useState('');
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: postComment,
    onMutate: async (newComment) => {
      await queryClient.cancelQueries({ queryKey: ['comments'] });

      const previousComments = queryClient.getQueryData(['comments']);

      queryClient.setQueryData(['comments'], (old) => [
        ...(old || []),
        { id: `temp-${Date.now()}`, text: newComment.text, parentId: newComment.parentId },
      ]);

      return { previousComments };
    },
    onError: (err, newComment, context) => {
      queryClient.setQueryData(['comments'], context.previousComments);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['comments'] });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    mutation.mutate({ text, parentId });
    setText('');
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: '10px', marginBottom: '10px' }}>
      <input
        type="text"
        id={parentId === null ? 'commentText' : undefined}
        name={parentId === null ? 'commentText' : undefined}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Write a comment..."
      />
      <button type="submit" id={parentId === null ? 'submitComment' : undefined}>Submit</button>
    </form>
  );
}

function App() {
  const { data: comments, isLoading, isError } = useQuery({
    queryKey: ['comments'],
    queryFn: fetchComments,
  });

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error loading comments</div>;

  return (
    <div style={{ padding: '20px' }}>
      <h1>Comments</h1>
      <CommentForm parentId={null} />
      <CommentList comments={comments} parentId={null} />
    </div>
  );
}

export default App;
