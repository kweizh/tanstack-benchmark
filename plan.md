# TanStack Benchmark Research Report

## 1. Library Overview

**Description**: TanStack is a collection of high-quality, open-source headless libraries for web development. It focuses on the "hard parts" of application development: state management, routing, data grids, and forms. The ecosystem's flagship is **TanStack Start**, a full-stack React framework that integrates these libraries into a cohesive, type-safe development experience.

**Ecosystem Role**: TanStack provides the foundational "engine" for modern web apps. Unlike opinionated UI kits, TanStack libraries are "headless," providing logic and state without markup, allowing developers to use any UI library (e.g., Tailwind, Shadcn UI) while maintaining strict type safety from the database to the browser.

**Project Setup**:
The recommended way to initialize a full-stack project is via the TanStack CLI:
```bash
npx @tanstack/cli@latest create
```
Standard project structure for TanStack Start:
- `app/routes/`: File-based routing directory.
- `app/routeTree.gen.ts`: Automatically generated type-safe route tree.
- `app/ssr.tsx` & `app/client.tsx`: Entry points for server and client.
- `app/router.tsx`: Shared router configuration.

---

## 2. Core Primitives & APIs

### TanStack Query (Server State)
- **Concept**: Manages asynchronous state (fetching, caching, synchronization).
- **Core APIs**: `useQuery`, `useMutation`, `queryOptions`.
- **Code Snippet**:
```typescript
const postsQuery = queryOptions({
  queryKey: ['posts'],
  queryFn: () => fetch('/api/posts').then(r => r.json()),
})

function Posts() {
  const { data } = useQuery(postsQuery)
  return <ul>{data?.map(post => <li key={post.id}>{post.title}</li>)}</ul>
}
```
- **Docs**: [TanStack Query Reference](https://tanstack.com/query/latest/docs/framework/react/reference/useQuery)

### TanStack Router (Type-Safe Routing)
- **Concept**: File-based routing with 100% type safety for paths, params, and search state.
- **Core APIs**: `createFileRoute`, `Link`, `useLoaderData`.
- **Code Snippet**:
```typescript
// routes/posts.$postId.tsx
export const Route = createFileRoute('/posts/$postId')({
  loader: ({ params }) => fetchPost(params.postId),
  component: PostComponent,
})

function PostComponent() {
  const data = Route.useLoaderData()
  return <div>{data.title}</div>
}
```
- **Docs**: [TanStack Router Guide](https://tanstack.com/router/latest/docs/routing/file-based-routing)

### TanStack Table (Headless Data Grid)
- **Concept**: Logic engine for complex tables (sorting, filtering, pagination).
- **Core APIs**: `useReactTable`, `createColumnHelper`.
- **Code Snippet**:
```typescript
const table = useReactTable({
  data,
  columns,
  getCoreRowModel: getCoreRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
})

// Render using table.getHeaderGroups() and table.getRowModel().rows
```
- **Docs**: [TanStack Table Core APIs](https://tanstack.com/table/latest/docs/api/core/table)

### TanStack Start (Full-Stack)
- **Concept**: SSR, Streaming, and Server Functions (RPCs).
- **Core APIs**: `createServerFn`, `createFileRoute`.
- **Code Snippet**:
```typescript
const updateCount = createServerFn({ method: 'POST' })
  .validator((d: number) => d)
  .handler(async ({ data }) => {
    // Server-side logic (DB update, etc.)
    return { success: true }
  })
```
- **Docs**: [TanStack Start Overview](https://tanstack.com/start/latest/docs/framework/react/overview)

---

## 3. Real-World Use Cases & Templates

- **SaaS Admin Dashboards**: Combining **Table** for data grids, **Query** for server state, and **Router** for deeply nested layouts and URL-driven filters.
- **E-commerce Product Filters**: Using **Router's Search Param Validation** (Zod-integrated) to manage complex filtering states in the URL.
- **AI-Powered Chat Apps**: Using **TanStack AI** for streaming responses and tool-calling with approval workflows.
- **Template**: [Trellaux](https://github.com/TanStack/router/tree/main/examples/react/start-trellaux) - A full-stack Trello clone showing Start, Query, and complex drag-and-drop state.

---

## 4. Developer Friction Points

1.  **Router Type Generation**: The `routeTree.gen.ts` file must be generated via a background watcher. AI agents often struggle to trigger this generation or understand that the file is missing during initial setup.
2.  **SSR Hydration with Query**: Misconfiguring `staleTime` or `gcTime` during SSR can lead to "Hydration Mismatch" errors where the server and client data differ.
3.  **Table Column Typing**: Defining complex columns with custom cell renderers and meta-data requires deep understanding of TypeScript generics, often leading to "Type instantiation is excessively deep" errors.
4.  **Headless Complexity**: The "Headless" nature means no default UI. Implementing a basic accessible table or form requires significant boilerplate (e.g., mapping over header groups).

---

## 5. Evaluation Ideas

### Simple
- Create a type-safe navigation menu with active link highlighting using TanStack Router.
- Implement a basic "Todo" list that fetches and creates items using TanStack Query.

### Intermediate
- Build a paginated data table with TanStack Table including server-side sorting.
- Create a multi-step registration form with TanStack Form and Zod validation.
- Implement a "Search" page where all filters (query, category, price range) are synced to the URL via TanStack Router.

### Complex
- Build a full-stack "Counter" app in TanStack Start using Server Functions and SQLite.
- Implement an "Optimistic Update" flow for a nested comment system using TanStack Query.
- Create an AI Chat interface using TanStack AI that includes a "Tool Approval" step for database writes.

---

## 6. Sources

1. [TanStack Official Site](https://tanstack.com/) - Main ecosystem hub.
2. [TanStack Query Docs](https://tanstack.com/query/latest/docs) - Server-state management reference.
3. [TanStack Router Docs](https://tanstack.com/router/latest/docs) - Type-safe routing and URL state reference.
4. [TanStack Start Docs](https://tanstack.com/start/latest/docs) - Full-stack framework and SSR reference.
5. [TanStack Table Docs](https://tanstack.com/table/latest/docs) - Headless table engine reference.
6. [TanStack Form Docs](https://tanstack.com/form/latest/docs) - Headless form state reference.
7. [TanStack AI Overview](https://tanstack.com/ai/latest/docs/getting-started/overview) - AI SDK and tool calling reference.
8. [TanStack GitHub Repository](https://github.com/TanStack) - Source code and community examples.