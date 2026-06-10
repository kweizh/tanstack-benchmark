# TanStack Start with Server Functions and SQLite

## Background
Create a full-stack Counter app using TanStack Start, showcasing Server Functions for backend logic and SQLite for persistence.

## Requirements
- Initialize a TanStack Start project.
- Implement a counter that persists its value in a SQLite database.
- Use a Server Function to read the current counter value.
- Use a Server Function to increment the counter value.
- The UI should display the current count and have a button to increment it.

## Implementation Hints
- Use `@tanstack/start` to set up the full-stack React framework.
- Use a SQLite library (like `better-sqlite3` or `sqlite3`) to store the count in a file (e.g., `sqlite.db`).
- Use `createServerFn` to define the backend RPCs for getting and incrementing the count.
- Ensure the route loader fetches the initial count using the Server Function.
- The increment button should call the increment Server Function and update the UI.
- Run the app on port 8394.

## Acceptance Criteria
- Project path: /home/user/project
- Start command: npm run dev
- Port: 8394
- Features:
  - The app serves a page at `/`.
  - The page displays the current count in an element with the attribute `data-testid="count"`.
  - The page has a button with the attribute `data-testid="increment"`.
  - Clicking the increment button calls the backend to increment the count, persists it to the SQLite database, and updates the UI.

