# Optimistic Update for Nested Comments with TanStack Query

## Background
Create a nested comment system that demonstrates an "Optimistic Update" flow using TanStack Query and React. Optimistic updates make the UI feel snappy by updating the local state immediately while the server request is still pending.

## Requirements
- Build a React frontend and a simple Node.js/Express backend.
- The backend should maintain an in-memory array of comments. Each comment has an `id`, `text`, and `parentId` (null for top-level comments).
- The frontend should fetch and display the comments in a nested/threaded structure.
- Users can add a new top-level comment.
- When adding a comment, the frontend MUST use TanStack Query's optimistic updates to immediately display the new comment in the UI before the server responds.
- The backend MUST have an artificial delay (exactly 1000ms) on the POST route to make the optimistic update observable.

## Implementation Hints
- Set up a Vite React project and an Express server. You can serve the built React app from Express or run them concurrently.
- Use `useQuery` to fetch the list of comments from the backend.
- Use `useMutation` for adding a new comment. In the `onMutate` callback, cancel any outgoing refetches for the comments query, snapshot the previous value, and optimistically update the cache with the new comment.
- Use `onError` to roll back the cache if the mutation fails, and `onSettled` to invalidate the query and ensure the UI is in sync with the server.

## Acceptance Criteria
- Project path: /home/user/project
- Start command: npm run start
- Port: 5732
- API Endpoints:
  - GET `/api/comments`: Returns status 200 and a JSON array of comments.
    ```json
    [
      {
        "id": "string",
        "text": "string",
        "parentId": "string | null"
      }
    ]
    ```
  - POST `/api/comments`: Accepts a JSON body with `text` and `parentId`. It MUST wait for 1000ms, generate an `id`, add it to the in-memory store, and return 201 Created with the new comment object.
- Frontend UI:
  - Accessible at `http://localhost:5732/`.
  - Displays the list of comments.
  - Contains a form with a text input (with `name="commentText"` or `id="commentText"`) and a submit button (with `id="submitComment"` or text "Submit").
  - Submitting the form MUST immediately (within 100ms) render the new comment text on the page using TanStack Query optimistic updates, while the 1000ms server request is pending.

