import {
  Outlet,
  createRootRoute,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "Product Search",
      },
    ],
  }),
  component: RootComponent,
});

function RootComponent() {
  return (
    <html lang="en">
      <head>
        <HeadContent />
        <style>{`
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: system-ui, sans-serif; background: #f5f5f5; color: #333; }
          nav { background: #1a1a2e; color: white; padding: 1rem 2rem; }
          nav a { color: #e0e0ff; text-decoration: none; font-size: 1.1rem; font-weight: 600; }
          nav a:hover { color: white; }
          main { padding: 2rem; max-width: 1200px; margin: 0 auto; }
          h1 { margin-bottom: 1.5rem; color: #1a1a2e; }
          .filters { display: flex; flex-wrap: wrap; gap: 0.75rem; margin-bottom: 1.5rem; background: white; padding: 1.25rem; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
          .filters label { display: flex; flex-direction: column; gap: 0.25rem; font-size: 0.85rem; font-weight: 600; color: #555; }
          .filters input, .filters select { padding: 0.4rem 0.6rem; border: 1px solid #ddd; border-radius: 4px; font-size: 0.9rem; min-width: 120px; }
          .filters button { align-self: flex-end; padding: 0.45rem 1rem; background: #1a1a2e; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.9rem; }
          .filters button:hover { background: #2d2d5e; }
          table { width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
          thead { background: #1a1a2e; color: white; }
          th { padding: 0.9rem 1rem; text-align: left; font-size: 0.9rem; letter-spacing: 0.03em; cursor: pointer; user-select: none; white-space: nowrap; }
          th:hover { background: #2d2d5e; }
          td { padding: 0.75rem 1rem; border-bottom: 1px solid #eee; font-size: 0.9rem; }
          tr:last-child td { border-bottom: none; }
          tr:hover td { background: #f9f9ff; }
          .pagination { display: flex; align-items: center; gap: 0.75rem; margin-top: 1.25rem; justify-content: center; flex-wrap: wrap; }
          .pagination button { padding: 0.4rem 0.75rem; background: #1a1a2e; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.85rem; }
          .pagination button:disabled { opacity: 0.4; cursor: not-allowed; }
          .pagination select { padding: 0.4rem 0.5rem; border: 1px solid #ddd; border-radius: 4px; font-size: 0.85rem; }
          .pagination span { font-size: 0.9rem; color: #555; }
          .sort-arrow { display: inline-block; margin-left: 4px; opacity: 0.7; }
          .category-badge { display: inline-block; padding: 0.2rem 0.55rem; border-radius: 12px; font-size: 0.78rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }
          .category-books { background: #e8f4fd; color: #1565c0; }
          .category-tech { background: #e8fde8; color: #1b5e20; }
          .category-home { background: #fff3e0; color: #e65100; }
          .price { font-weight: 600; color: #2e7d32; }
        `}</style>
      </head>
      <body>
        <nav>
          <a href="/products">🛒 Product Search</a>
        </nav>
        <main>
          <Outlet />
        </main>
        <Scripts />
      </body>
    </html>
  );
}
