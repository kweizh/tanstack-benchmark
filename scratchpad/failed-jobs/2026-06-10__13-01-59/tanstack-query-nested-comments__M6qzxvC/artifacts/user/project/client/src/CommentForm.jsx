import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { postComment } from './api';

export default function CommentForm() {
  const [text, setText] = useState('');
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: postComment,
    onMutate: async (newComment) => {
      // Cancel any outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: ['comments'] });

      // Snapshot the previous value for rollback
      const previousComments = queryClient.getQueryData(['comments']);

      // Optimistically update the cache
      queryClient.setQueryData(['comments'], (old) => {
        const optimisticComment = {
          id: 'optimistic-' + Date.now(),
          text: newComment.text,
          parentId: newComment.parentId || null,
          _optimistic: true,
        };
        return [...(old || []), optimisticComment];
      });

      // Return the snapshot for onError rollback
      return { previousComments };
    },
    onError: (_err, _newComment, context) => {
      // Roll back to the previous value on error
      if (context?.previousComments) {
        queryClient.setQueryData(['comments'], context.previousComments);
      }
    },
    onSettled: () => {
      // Always refetch to ensure the UI is in sync with the server
      queryClient.invalidateQueries({ queryKey: ['comments'] });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;

    mutation.mutate({ text: trimmed, parentId: null });
    setText('');
  };

  return (
    <form className="comment-form" onSubmit={handleSubmit}>
      <input
        type="text"
        name="commentText"
        id="commentText"
        placeholder="Write a comment..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={mutation.isPending}
      />
      <button type="submit" id="submitComment" disabled={mutation.isPending || !text.trim()}>
        Submit
      </button>
    </form>
  );
}
