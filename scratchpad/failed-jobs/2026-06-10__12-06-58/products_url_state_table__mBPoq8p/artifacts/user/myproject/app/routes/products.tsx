import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type PaginationState,
} from "@tanstack/react-table";
import { useCallback, useMemo, useState } from "react";
import { productSearchSchema, type ProductSearch } from "~/lib/schema";
import type { Product, ProductsResult } from "~/lib/products";

// ─── Route definition ────────────────────────────────────────────────────────

export const Route = createFileRoute("/products")({
  validateSearch: (raw) => {
    const parsed = productSearchSchema.safeParse(raw);
    if (!parsed.success) {
      // Return defaults on invalid params so the page doesn't crash
      return productSearchSchema.parse({});
    }
    return parsed.data;
  },

  loaderDeps: ({ search }) => search,

  loader: async ({ deps }) => {
    const params = new URLSearchParams();
    if (deps.q) params.set("q", deps.q);
    if (deps.category) params.set("category", deps.category);
    if (deps.minPrice !== undefined) params.set("minPrice", String(deps.minPrice));
    if (deps.maxPrice !== undefined) params.set("maxPrice", String(deps.maxPrice));
    params.set("sort", deps.sort);
    params.set("order", deps.order);
    params.set("page", String(deps.page));
    params.set("pageSize", String(deps.pageSize));

    const res = await fetch(`/api/products?${params.toString()}`);
    if (!res.ok) {
      const err = await res.json() as { error: string };
      throw new Error(err.error);
    }
    return res.json() as Promise<ProductsResult>;
  },

  component: ProductsPage,
});

// ─── Column definitions ───────────────────────────────────────────────────────

const columns: ColumnDef<Product>[] = [
  { accessorKey: "id", header: "ID", size: 60 },
  { accessorKey: "name", header: "Name" },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ getValue }) => {
      const cat = getValue<string>();
      return (
        <span className={`category-badge category-${cat}`}>{cat}</span>
      );
    },
  },
  {
    accessorKey: "price",
    header: "Price",
    cell: ({ getValue }) => (
      <span className="price">${getValue<number>().toFixed(2)}</span>
    ),
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

function ProductsPage() {
  const navigate = useNavigate({ from: "/products" });
  const search = Route.useSearch();
  const data = Route.useLoaderData();

  // Local form state for filter inputs (committed on submit/change)
  const [filterForm, setFilterForm] = useState({
    q: search.q ?? "",
    category: search.category ?? "",
    minPrice: search.minPrice !== undefined ? String(search.minPrice) : "",
    maxPrice: search.maxPrice !== undefined ? String(search.maxPrice) : "",
  });

  // Derive table state from URL search params
  const sorting: SortingState = useMemo(
    () => [{ id: search.sort, desc: search.order === "desc" }],
    [search.sort, search.order],
  );

  const pagination: PaginationState = useMemo(
    () => ({ pageIndex: search.page - 1, pageSize: search.pageSize }),
    [search.page, search.pageSize],
  );

  const pageCount = useMemo(
    () => Math.max(1, Math.ceil(data.total / data.pageSize)),
    [data.total, data.pageSize],
  );

  // Navigate helper — merges partial updates into current search params
  const updateSearch = useCallback(
    (updates: Partial<ProductSearch>) => {
      navigate({
        search: (prev) => ({ ...prev, ...updates }),
        replace: false,
      });
    },
    [navigate],
  );

  const table = useReactTable({
    data: data.rows,
    columns,
    pageCount,
    state: { sorting, pagination },
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: (updater) => {
      const next =
        typeof updater === "function" ? updater(sorting) : updater;
      const col = next[0];
      if (col) {
        updateSearch({
          sort: col.id as ProductSearch["sort"],
          order: col.desc ? "desc" : "asc",
          page: 1,
        });
      } else {
        updateSearch({ sort: "id", order: "asc", page: 1 });
      }
    },
    onPaginationChange: (updater) => {
      const next =
        typeof updater === "function" ? updater(pagination) : updater;
      updateSearch({
        page: next.pageIndex + 1,
        pageSize: next.pageSize,
      });
    },
  });

  // ── Filter form handlers ──
  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updates: Partial<ProductSearch> = { page: 1 };
    updates.q = filterForm.q || undefined;
    updates.category = (filterForm.category as ProductSearch["category"]) || undefined;
    updates.minPrice = filterForm.minPrice !== "" ? Number(filterForm.minPrice) : undefined;
    updates.maxPrice = filterForm.maxPrice !== "" ? Number(filterForm.maxPrice) : undefined;
    navigate({
      search: (prev) => ({
        ...prev,
        ...updates,
        // Clear old filter keys explicitly when empty
        q: updates.q,
        category: updates.category,
        minPrice: updates.minPrice,
        maxPrice: updates.maxPrice,
      }),
      replace: false,
    });
  };

  const handleReset = () => {
    setFilterForm({ q: "", category: "", minPrice: "", maxPrice: "" });
    navigate({
      search: {
        sort: search.sort,
        order: search.order,
        page: 1,
        pageSize: search.pageSize,
      },
      replace: false,
    });
  };

  return (
    <>
      <h1>Products</h1>

      {/* ── Filter controls ── */}
      <form className="filters" onSubmit={handleFilterSubmit}>
        <label>
          Search
          <input
            type="text"
            placeholder="name..."
            value={filterForm.q}
            onChange={(e) =>
              setFilterForm((f) => ({ ...f, q: e.target.value }))
            }
          />
        </label>
        <label>
          Category
          <select
            value={filterForm.category}
            onChange={(e) =>
              setFilterForm((f) => ({ ...f, category: e.target.value }))
            }
          >
            <option value="">All</option>
            <option value="books">Books</option>
            <option value="tech">Tech</option>
            <option value="home">Home</option>
          </select>
        </label>
        <label>
          Min Price
          <input
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            value={filterForm.minPrice}
            onChange={(e) =>
              setFilterForm((f) => ({ ...f, minPrice: e.target.value }))
            }
          />
        </label>
        <label>
          Max Price
          <input
            type="number"
            min="0"
            step="0.01"
            placeholder="any"
            value={filterForm.maxPrice}
            onChange={(e) =>
              setFilterForm((f) => ({ ...f, maxPrice: e.target.value }))
            }
          />
        </label>
        <button type="submit">Apply</button>
        <button type="button" onClick={handleReset}>
          Reset
        </button>
      </form>

      {/* ── Table ── */}
      <table>
        <thead>
          {table.getHeaderGroups().map((hg) => (
            <tr key={hg.id}>
              {hg.headers.map((header) => {
                const sorted = header.column.getIsSorted();
                return (
                  <th
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    style={{ width: header.getSize() }}
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
                    <span className="sort-arrow">
                      {sorted === "asc"
                        ? " ▲"
                        : sorted === "desc"
                          ? " ▼"
                          : " ↕"}
                    </span>
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} style={{ textAlign: "center", padding: "2rem", color: "#888" }}>
                No products found.
              </td>
            </tr>
          ) : (
            table.getRowModel().rows.map((row) => (
              <tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* ── Pagination controls ── */}
      <div className="pagination">
        <button
          onClick={() => table.firstPage()}
          disabled={!table.getCanPreviousPage()}
        >
          «
        </button>
        <button
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          ‹ Prev
        </button>
        <span>
          Page{" "}
          <strong>
            {pagination.pageIndex + 1} / {pageCount}
          </strong>
          {" "}— {data.total} result{data.total !== 1 ? "s" : ""}
        </span>
        <button
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next ›
        </button>
        <button
          onClick={() => table.lastPage()}
          disabled={!table.getCanNextPage()}
        >
          »
        </button>
        <label style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.85rem" }}>
          Per page:
          <select
            value={pagination.pageSize}
            onChange={(e) =>
              table.setPageSize(Number(e.target.value))
            }
          >
            {[5, 10, 12].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </label>
      </div>
    </>
  );
}
