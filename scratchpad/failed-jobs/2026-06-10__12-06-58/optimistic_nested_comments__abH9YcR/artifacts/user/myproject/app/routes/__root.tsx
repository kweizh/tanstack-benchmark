import {
  Outlet,
  ScrollRestoration,
  createRootRouteWithContext,
} from "@tanstack/react-router";
import { Meta, Scripts } from "@tanstack/start";
import type { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

interface RouterContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterContext>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Nested Comment Thread" },
    ],
  }),
  component: RootComponent,
});

function RootComponent() {
  return (
    <html lang="en">
      <head>
        <Meta />
        <style dangerouslySetInnerHTML={{ __html: globalStyles }} />
      </head>
      <body>
        <Outlet />
        <ScrollRestoration />
        <ReactQueryDevtools />
        <Scripts />
      </body>
    </html>
  );
}

const globalStyles = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    background: #f5f5f5;
    color: #1a1a1a;
    line-height: 1.6;
  }
  #app { max-width: 780px; margin: 0 auto; padding: 2rem 1rem; }
  h1 { font-size: 1.75rem; font-weight: 700; margin-bottom: 1.5rem; color: #111; }
  h2 { font-size: 1.1rem; font-weight: 600; margin-bottom: 0.75rem; }

  .comment {
    background: #fff;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    padding: 0.75rem 1rem;
    margin-bottom: 0.5rem;
  }
  .comment__body { font-size: 0.95rem; color: #333; }
  .comment__meta { font-size: 0.78rem; color: #888; margin-bottom: 0.3rem; }
  .comment__children { margin-left: 1.5rem; margin-top: 0.5rem; border-left: 2px solid #e8e8e8; padding-left: 1rem; }
  .comment--optimistic { opacity: 0.55; border-style: dashed; }
  .comment--rollback { opacity: 0.4; background: #fff3f3; border-color: #f5a0a0; }

  .reply-btn {
    font-size: 0.78rem;
    color: #555;
    cursor: pointer;
    background: none;
    border: none;
    padding: 0.2rem 0;
    margin-top: 0.25rem;
    text-decoration: underline;
  }
  .reply-btn:hover { color: #000; }

  .form {
    background: #fff;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    padding: 1rem;
    margin-bottom: 1.5rem;
  }
  .form label { display: block; font-size: 0.85rem; font-weight: 600; margin-bottom: 0.4rem; color: #444; }
  .form textarea {
    width: 100%;
    padding: 0.5rem 0.75rem;
    border: 1px solid #ccc;
    border-radius: 6px;
    font-size: 0.95rem;
    resize: vertical;
    min-height: 80px;
    font-family: inherit;
  }
  .form textarea:focus { outline: none; border-color: #4f46e5; box-shadow: 0 0 0 2px #e0e0ff; }
  .form__actions { display: flex; gap: 0.5rem; margin-top: 0.5rem; align-items: center; flex-wrap: wrap; }
  .btn {
    padding: 0.45rem 1rem;
    border: none;
    border-radius: 6px;
    font-size: 0.9rem;
    cursor: pointer;
    font-weight: 600;
    transition: background 0.15s;
  }
  .btn--primary { background: #4f46e5; color: #fff; }
  .btn--primary:hover:not(:disabled) { background: #4338ca; }
  .btn--primary:disabled { opacity: 0.5; cursor: not-allowed; }
  .btn--danger { background: #dc2626; color: #fff; }
  .btn--danger:hover:not(:disabled) { background: #b91c1c; }
  .btn--danger:disabled { opacity: 0.5; cursor: not-allowed; }
  .btn--ghost { background: transparent; color: #555; border: 1px solid #ccc; }
  .btn--ghost:hover { background: #f5f5f5; }

  .status { font-size: 0.85rem; padding: 0.4rem 0.75rem; border-radius: 5px; }
  .status--success { background: #d1fae5; color: #065f46; }
  .status--error { background: #fee2e2; color: #991b1b; }
  .status--pending { background: #fef3c7; color: #92400e; }

  .loading { text-align: center; padding: 2rem; color: #888; }
  .error-box { background: #fee2e2; border: 1px solid #fca5a5; border-radius: 8px; padding: 1rem; color: #991b1b; margin-bottom: 1rem; }
`;
