# URL-Driven Product Search with TanStack Router + TanStack Table

## Background
Build a small full-stack application with **TanStack Start** that exposes a `/products` page. The page must render a paginated, sortable, filterable product table whose **entire state lives in the URL search params**. The same params drive a server-side REST endpoint that returns the rows the table should display. The goal of the task is to exercise TanStack Router's typed search-param validation (via Zod), TanStack Table's `manualPagination` / `manualSorting` / `manualFiltering` modes, and loader-based data fetching keyed off the validated search params.

## Requirements
- A `/products` route built with TanStack Router file-based routing inside a TanStack Start app.
- The route must declare its search-param schema with **Zod** through `validateSearch` and load data via a `loader` that reads the validated search params.
- The visible table must be rendered with **TanStack Table** in fully controlled mode: `manualPagination: true`, `manualSorting: true`, `manualFiltering: true`. The table's `state` (pagination, sorting, global filter / column filters) and the URL search params must stay in sync — changing a control updates the URL, and pasting a URL produces the same table state on a cold reload.
- A REST endpoint `GET /api/products` served by the same TanStack Start server. The endpoint reads the same query parameters as the page, performs the filtering / sorting / pagination **server-side**, and returns JSON.
- A fixed in-memory seed dataset of 12 products (see *Seed Dataset* below). The app must ship exactly this dataset — do not add, remove, or rename items.
- The app must listen on the port specified in *Acceptance Criteria*.

## Seed Dataset
The server must use exactly these 12 products as the only source of truth. Field types: `id: number`, `name: string`, `category: "books" | "tech" | "home"`, `price: number`.

| id | name                     | category | price  |
|----|--------------------------|----------|--------|
| 1  | JavaScript Programming   | books    | 35.50  |
| 2  | The Pragmatic Programmer | books    | 42.00  |
| 3  | Design Patterns          | books    | 55.00  |
| 4  | Clean Code               | books    | 39.99  |
| 5  | Wireless Mouse           | tech     | 25.00  |
| 6  | Mechanical Keyboard      | tech     | 89.99  |
| 7  | USB-C Hub                | tech     | 49.50  |
| 8  | 4K Monitor               | tech     | 320.00 |
| 9  | Coffee Maker             | home     | 75.00  |
| 10 | Vacuum Cleaner           | home     | 145.00 |
| 11 | Desk Lamp                | home     | 32.00  |
| 12 | Throw Pillow             | home     | 18.99  |

## URL / REST Contract
Both `/products` (HTML) and `/api/products` (JSON) accept the same query parameters:

- `q` (string, optional) — case-insensitive substring match against `name`.
- `category` (optional) — one of `books`, `tech`, `home`.
- `minPrice` (number, optional) — inclusive lower bound on `price`.
- `maxPrice` (number, optional) — inclusive upper bound on `price`.
- `sort` (optional) — one of `id`, `name`, `price`, `category`. Default `id`.
- `order` (optional) — `asc` or `desc`. Default `asc`.
- `page` (integer, optional, 1-based). Default `1`.
- `pageSize` (integer, optional). Default `5`.

Response body for `GET /api/products` (HTTP 200):
```json
{
  "rows": [{ "id": number, "name": string, "category": string, "price": number }],
  "total": number,
  "page": number,
  "pageSize": number
}
```
- `total` is the count after filters, before pagination.
- `rows` is the page slice after filtering, sorting, and pagination.

Validation:
- Any query parameter that fails validation (e.g. `category=invalid`, `order=sideways`, `page=-1`, non-numeric `minPrice`) must respond with HTTP **400** and JSON body `{ "error": string }`.
- The same validation rules must be enforced on the page route — invalid search params should not crash the server.

## Implementation Hints
- Initialize a TanStack Start project (e.g. `npx @tanstack/cli@latest create`) and develop inside `/home/user/myproject`. Make sure the dev/start command listens on the port specified below.
- Use a single Zod schema as the source of truth for both `validateSearch` on the route and the API handler's parameter parsing — share it between the two so the rules stay aligned.
- Reach for TanStack Start's Server Routes (file-based API routes) to host `/api/products` inside the same app, so the API and the HTML page share a process and a port.
- In the route's `loader`, build a `fetch` URL using the validated search params and hydrate the page with the JSON the API returns.
- Configure TanStack Table with `manualPagination`, `manualSorting`, `manualFiltering`, and pass `pageCount` derived from `total / pageSize`. Drive `onPaginationChange` / `onSortingChange` by navigating to a new set of search params.
- The HTML response for `/products` must contain the human-readable product names of the rows currently being shown so they can be matched as substrings — don't hide them in JSON-only payloads or images.

## Acceptance Criteria
- Project path: /home/user/myproject
- Start command: npm run start
- Port: 42101
- Routes / endpoints:
  - `GET /products` — HTML page rendered by TanStack Start. The HTML must contain the names of the product rows currently displayed (as plain text substrings).
  - `GET /api/products` — JSON endpoint following the URL / REST contract above. Response shape: `{ rows, total, page, pageSize }`. Defaults: `page=1`, `pageSize=5`, `sort=id`, `order=asc`.
- The server must enforce the validation rules described above and respond with HTTP 400 + `{ "error": string }` for invalid parameters.
- The fixed 12-product dataset described in *Seed Dataset* must be the only data served.

