import { createRootRoute, Outlet, ScrollRestoration } from '@tanstack/react-router'
import { Meta, Scripts } from '@tanstack/start'
import type { ReactNode } from 'react'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'My Blog' },
    ],
    links: [],
  }),
  component: RootComponent,
})

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  )
}

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <Meta />
        <style>{`
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: system-ui, sans-serif; line-height: 1.6; color: #333; background: #f9f9f9; }
          a { color: #0070f3; text-decoration: none; }
          a:hover { text-decoration: underline; }
          .container { max-width: 800px; margin: 0 auto; padding: 2rem 1rem; }
          header { background: #fff; border-bottom: 1px solid #eee; padding: 1rem 0; margin-bottom: 2rem; }
          header .container { padding-top: 0.5rem; padding-bottom: 0.5rem; }
          header h1 { font-size: 1.5rem; }
          .post-list { list-style: none; }
          .post-list li { background: #fff; border: 1px solid #eee; border-radius: 8px; padding: 1.25rem 1.5rem; margin-bottom: 1rem; }
          .post-list h2 { font-size: 1.2rem; margin-bottom: 0.25rem; }
          .post-content h1 { font-size: 2rem; margin: 1.5rem 0 0.75rem; }
          .post-content h2 { font-size: 1.5rem; margin: 1.25rem 0 0.5rem; }
          .post-content h3 { font-size: 1.2rem; margin: 1rem 0 0.5rem; }
          .post-content p { margin-bottom: 1rem; }
          .post-content ul, .post-content ol { margin: 0.5rem 0 1rem 1.5rem; }
          .post-content li { margin-bottom: 0.25rem; }
          .post-content blockquote { border-left: 4px solid #0070f3; padding-left: 1rem; color: #555; margin: 1rem 0; }
          .post-content code { background: #f0f0f0; padding: 0.1em 0.3em; border-radius: 3px; font-size: 0.9em; }
          .post-content pre { background: #1e1e1e; color: #d4d4d4; padding: 1rem; border-radius: 8px; overflow-x: auto; margin-bottom: 1rem; }
          .post-content pre code { background: none; padding: 0; }
          .back-link { display: inline-block; margin-bottom: 1.5rem; }
        `}</style>
      </head>
      <body>
        <header>
          <div className="container">
            <h1><a href="/">My Blog</a></h1>
          </div>
        </header>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}
