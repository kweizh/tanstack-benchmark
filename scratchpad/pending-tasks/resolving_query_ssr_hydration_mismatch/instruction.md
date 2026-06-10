When combining TanStack Query with Server-Side Rendering (SSR), misconfiguring caching durations often leads to "Hydration Mismatch" errors where server HTML and initial client state differ.

You need to configure the global `QueryClient` initialization in a TanStack Start `app.tsx` file to properly align server and client caching behavior and prevent immediate refetching on hydration. 

**Constraints:**
- Must set a default `staleTime` strictly greater than `0` (e.g., `60 * 1000`) in the default options to prevent instant invalidation.
- Must conditionally initialize the `QueryClient` so it is not shared across users during SSR, but remains a singleton on the client.
- Do NOT alter any specific component's `useQuery` configurations; apply the fix at the root provider level.