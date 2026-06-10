TanStack Query manages asynchronous server state and allows optimistic updates for a snappy user experience during data mutations.

You need to implement a `useMutation` hook for adding a new "Post" that optimistically updates the local cache before the network request finishes, and rolls back if the network request fails. 

**Constraints:**
- Must synchronously update the cache array for the `['posts']` query key inside the `onMutate` callback.
- Must implement the rollback logic in the `onError` callback using the context returned from `onMutate`.
- Must trigger a background refetch via `onSettled` to ensure synchronization.