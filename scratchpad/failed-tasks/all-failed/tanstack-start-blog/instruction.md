# TanStack Start Markdown Blog

## Requirements
Build a full-stack blog application using TanStack Start. You must use Server Functions to fetch data and render Markdown content into HTML.

## Acceptance Criteria
- Project path: /home/user/blog
- Start command: npm run dev
- Port: 7392
- Database: A SQLite database at `/home/user/blog/blog.db` containing a `posts` table with `id` (INTEGER PRIMARY KEY), `title` (TEXT), and `content` (TEXT, markdown format) columns.
- Server Functions: Must be used to fetch data from the SQLite database.
- Routes:
  - GET `/`: Renders a list of blog posts. Must display the `title` of each post and include a link to its detail page.
  - GET `/posts/$postId`: Renders the specific post by ID. The markdown `content` from the database MUST be rendered as HTML (e.g., `# Heading` becomes `<h1>Heading</h1>`).

The verifier will insert a test post into `blog.db` and use a browser to navigate to `http://localhost:7392/` to check the post list, and then to `http://localhost:7392/posts/1` to verify the markdown is correctly rendered as HTML elements.

