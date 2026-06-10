# TanStack Table Server-Side Pagination & Sorting

## Background
Build a web application using TanStack Table that demonstrates server-side pagination and server-side sorting.

## Requirements
- Initialize a React project with a Node.js backend (or use TanStack Start for a full-stack approach).
- Create a dataset of 50 mock items on the server. Each item must have the following fields:
  - `id` (number, 1 to 50)
  - `name` (string, e.g., "Item 1" to "Item 50")
  - `value` (number, e.g., 100 to 5000)
- Expose a REST API endpoint to fetch the data with pagination and sorting parameters.
- Build a frontend UI using TanStack Table to display this data.
- Implement server-side pagination (10 items per page by default).
- Implement server-side sorting (clicking a column header requests sorted data from the server).
- The application MUST run on port 8321.

## Implementation Hints
- Use `useReactTable` with `manualPagination: true` and `manualSorting: true`.
- Keep track of `pagination` and `sorting` states in your React component and use them as dependencies to fetch data from the backend.
- For the backend, an Express server or TanStack Start server functions can be used. If using a separate backend, ensure CORS is handled or serve the React app from the same server.

## Acceptance Criteria
- Project path: /home/user/project
- Start command: npm run start
- Port: 8321
- API Endpoint:
  - `GET /api/data?page=<page_number>&limit=<items_per_page>&sortBy=<column_name>&sortDesc=<true|false>`
  - The `page` parameter should be 1-indexed.
  - The response must be JSON in the format: `{ "data": [...], "totalCount": 50 }`.
- UI Requirements:
  - The root URL `http://localhost:8321/` must render a table displaying the `id`, `name`, and `value` columns.
  - The table must include a "Next" button and a "Previous" button for pagination.
  - Clicking the `value` column header must toggle the sorting order and fetch the sorted data from the server.
