import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchComments } from './api';
import CommentForm from './CommentForm';
import CommentList from './CommentList';

export default function App() {
  const { data: comments, isLoading, isError, error } = useQuery({
    queryKey: ['comments'],
    queryFn: fetchComments,
  });

  return (
    <div className="app">
      <h1>Nested Comments</h1>
      <CommentForm />
      <CommentList
        comments={comments}
        isLoading={isLoading}
        isError={isError}
        error={error}
      />
    </div>
  );
}
