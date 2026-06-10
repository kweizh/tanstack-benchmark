# TanStack AI Chat with Tool Approval

## Background
Build a full-stack AI chat application using TanStack Start and TanStack AI. The application must feature an AI assistant capable of writing notes to a local SQLite database, but these writes must be gated by a user approval workflow.

## Requirements
- Create a TanStack Start application with a chat interface on the root route (`/`).
- Integrate TanStack AI (or Vercel AI SDK within TanStack Start) to provide streaming chat capabilities.
- Implement a tool named `createNote` that inserts a note into a local SQLite database (`notes.db`).
- The `createNote` tool must require user approval (e.g., returning a confirmation request to the client).
- The UI must display an approval prompt when the AI attempts to use the `createNote` tool.
- The user must be able to approve the tool call, which resumes the chat stream and executes the database write.
- The application must run on port 4821.

## Implementation Hints
- Use the `@tanstack/start` plugin and file-based routing.
- Use AI SDK's `streamText` and `useChat` for the chat interface.
- Define the `createNote` tool with a configuration that pauses execution for client-side confirmation.
- Use a lightweight SQLite client (like `better-sqlite3`) for the database operations.
- When the `useChat` hook yields a tool call requiring confirmation, render an "Approve" button that calls `addToolResult` to proceed.

## Acceptance Criteria
- Project path: /home/user/myproject
- Start command: npm run dev -- --port 4821
- Port: 4821
- API Endpoints/Routes:
  - GET `/`: Renders the chat interface.
  - POST `/api/chat`: The AI chat endpoint that handles messages, streams responses, and yields tool calls.
- Features:
  - The AI can suggest creating a note, which triggers a tool call for `createNote`.
  - The tool call must pause and wait for client approval.
  - Upon client approval, the note is written to `notes.db` and the AI acknowledges the creation.

