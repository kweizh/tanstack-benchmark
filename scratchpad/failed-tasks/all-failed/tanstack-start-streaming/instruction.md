# TanStack Start Streaming Dashboard

## Background
Create a TanStack Start application that demonstrates streaming Server-Side Rendering (SSR) and Suspense by building a dashboard with simulated slow data fetching.

## Requirements
- Initialize a TanStack Start project in `/home/user/project`.
- Configure the application to run on port 7384.
- Implement a dashboard page at the route `/dashboard`.
- Create a server function using `createServerFn` that simulates a slow database query (e.g., a 2-second delay) and returns some dashboard metrics (e.g., `{"revenue": 15000, "users": 420}`).
- Fetch this data in the dashboard route using TanStack Query or Router loaders.
- Wrap the data rendering component in a React `<Suspense>` boundary with a fallback UI containing the exact text `Loading metrics...`.
- The application must stream the HTML response to the client, showing the fallback first, and then the actual data once the server function resolves.

## Implementation Hints
- Use the `@tanstack/cli` or manual setup to bootstrap a TanStack Start project.
- Use `app.config.ts` (Vinxi configuration) to set the dev server port to 7384.
- Use `createServerFn` to define the delayed data fetching logic.
- In your route component, use `await` inside the component or pass a promise to a child component wrapped in `<Suspense>` to trigger streaming.
- Ensure `ssr: true` is enabled in the router configuration so streaming SSR works.

## Acceptance Criteria
- Project path: /home/user/project
- Start command: npm run dev
- Port: 7384
- Route: `/dashboard`
- When fetching the `/dashboard` HTML document directly, the early streamed HTML response must contain the text `Loading metrics...`.
- After the simulated delay, the final HTML response must contain the metrics data (e.g., `15000` and `420`).

