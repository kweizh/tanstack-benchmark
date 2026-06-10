import * as React from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
} from '@tanstack/react-table'
import { productsSearchSchema, type Product } from '../products-schema'

export const Route = createFileRoute('/products')({
  validateSearch: (search) => productsSearchSchema.parse(search),
  loaderDeps: ({ search }) => search,
  loader: async ({ deps }) => {
    const searchParams = new URLSearchParams()
    Object.entries(deps).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.set(key, String(value))
      }
    })

    // Fetch from the local API endpoint
    const res = await fetch(`/api/products?${searchParams.toString()}`)
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}))
      throw new Error(errData.error || 'Failed to fetch products')
    }

    return res.json() as Promise<{
      rows: Product[]
      total: number
      page: number
      pageSize: number
    }>
  },
  errorComponent: ({ error }) => {
    return (
      <main className="page-wrap px-4 py-12">
        <div className="rounded-2xl p-6 sm:p-8 bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.3)] text-center">
          <h1 className="text-2xl font-bold text-red-500 mb-3">
            Invalid Search Parameters
          </h1>
          <p className="text-[var(--sea-ink-soft)] mb-6 max-w-lg mx-auto">
            {error.message}
          </p>
          <a
            href="/products"
            className="inline-block rounded-full bg-[var(--lagoon)] px-6 py-2.5 text-sm font-semibold text-white no-underline hover:bg-[var(--lagoon-deep)] transition"
          >
            Reset to Defaults
          </a>
        </div>
      </main>
    )
  },
})

export default function ProductsPage() {
  const search = Route.useSearch()
  const data = Route.useLoaderData()
  const navigate = useNavigate({ from: Route.fullPath })

  // Controlled input states
  const [qInput, setQInput] = React.useState(search.q || '')
  const [minPriceInput, setMinPriceInput] = React.useState(
    search.minPrice !== undefined ? String(search.minPrice) : ''
  )
  const [maxPriceInput, setMaxPriceInput] = React.useState(
    search.maxPrice !== undefined ? String(search.maxPrice) : ''
  )

  // Sync inputs with URL changes (e.g. back/forward buttons or clear filters)
  React.useEffect(() => {
    setQInput(search.q || '')
  }, [search.q])

  React.useEffect(() => {
    setMinPriceInput(search.minPrice !== undefined ? String(search.minPrice) : '')
  }, [search.minPrice])

  React.useEffect(() => {
    setMaxPriceInput(search.maxPrice !== undefined ? String(search.maxPrice) : '')
  }, [search.maxPrice])

  // Table columns definition
  const columns = React.useMemo<ColumnDef<Product>[]>(
    () => [
      {
        accessorKey: 'id',
        header: 'ID',
      },
      {
        accessorKey: 'name',
        header: 'Name',
      },
      {
        accessorKey: 'category',
        header: 'Category',
        cell: (info) => {
          const val = info.getValue() as string
          return (
            <span className="inline-block rounded-full border border-[var(--chip-line)] bg-[var(--chip-bg)] px-2.5 py-0.5 text-xs text-[var(--sea-ink-soft)]">
              {val}
            </span>
          )
        },
      },
      {
        accessorKey: 'price',
        header: 'Price',
        cell: (info) => {
          const val = info.getValue() as number
          return `$${val.toFixed(2)}`
        },
      },
    ],
    []
  )

  // Map search params to table state
  const pagination = React.useMemo(
    () => ({
      pageIndex: search.page - 1,
      pageSize: search.pageSize,
    }),
    [search.page, search.pageSize]
  )

  const sorting = React.useMemo(
    () => [
      {
        id: search.sort,
        desc: search.order === 'desc',
      },
    ],
    [search.sort, search.order]
  )

  // Update URL on table pagination changes
  const onPaginationChange = (updater: any) => {
    const nextState =
      typeof updater === 'function' ? updater(pagination) : updater
    navigate({
      search: (prev) => ({
        ...prev,
        page: nextState.pageIndex + 1,
        pageSize: nextState.pageSize,
      }),
      replace: true,
    })
  }

  // Update URL on table sorting changes
  const onSortingChange = (updater: any) => {
    const nextState = typeof updater === 'function' ? updater(sorting) : updater
    const firstSort = nextState[0]
    navigate({
      search: (prev) => ({
        ...prev,
        sort: firstSort ? (firstSort.id as any) : 'id',
        order: firstSort ? (firstSort.desc ? 'desc' : 'asc') : 'asc',
        page: 1, // Reset to page 1 on sort change
      }),
      replace: true,
    })
  }

  // Handle filter form submission
  const handleFilterSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault()

    const minPriceNum = minPriceInput === '' ? undefined : Number(minPriceInput)
    const maxPriceNum = maxPriceInput === '' ? undefined : Number(maxPriceInput)

    navigate({
      search: (prev) => ({
        ...prev,
        q: qInput || undefined,
        minPrice: isNaN(minPriceNum!) ? undefined : minPriceNum,
        maxPrice: isNaN(maxPriceNum!) ? undefined : maxPriceNum,
        page: 1, // Reset to page 1 on filter change
      }),
      replace: true,
    })
  }

  // Handle immediate category dropdown change
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value
    navigate({
      search: (prev) => ({
        ...prev,
        category: val === 'all' ? undefined : (val as any),
        page: 1, // Reset to page 1 on filter change
      }),
      replace: true,
    })
  }

  // Clear all filters
  const handleClearFilters = () => {
    setQInput('')
    setMinPriceInput('')
    setMaxPriceInput('')
    navigate({
      search: () => ({
        page: 1,
        pageSize: 5,
        sort: 'id',
        order: 'asc',
      }),
      replace: true,
    })
  }

  const table = useReactTable({
    data: data.rows,
    columns,
    pageCount: Math.ceil(data.total / search.pageSize),
    state: {
      pagination,
      sorting,
    },
    onPaginationChange,
    onSortingChange,
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <main className="page-wrap px-4 py-12">
      <section className="island-shell rise-in rounded-3xl p-6 sm:p-8 mb-8">
        <p className="island-kicker mb-2">Products</p>
        <h1 className="display-title mb-3 text-3xl font-bold text-[var(--sea-ink)] sm:text-4xl">
          URL-Driven Product Search
        </h1>
        <p className="m-0 max-w-3xl text-sm leading-relaxed text-[var(--sea-ink-soft)]">
          This table's entire state (sorting, filtering, and pagination) is synchronized with the URL search parameters.
          The data is fetched server-side based on these parameters.
        </p>
      </section>

      {/* Filter Controls Form */}
      <form
        onSubmit={handleFilterSubmit}
        className="island-shell rounded-2xl p-5 mb-6 grid gap-4 md:grid-cols-5 items-end"
      >
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-[var(--sea-ink-soft)]">
            Search Name
          </label>
          <input
            type="text"
            placeholder="Search products..."
            value={qInput}
            onChange={(e) => setQInput(e.target.value)}
            className="w-full rounded-xl border border-[var(--line)] bg-[var(--chip-bg)] px-3 py-2 text-sm text-[var(--sea-ink)] focus:border-[var(--lagoon)] focus:outline-none"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-[var(--sea-ink-soft)]">
            Category
          </label>
          <select
            value={search.category || 'all'}
            onChange={handleCategoryChange}
            className="w-full rounded-xl border border-[var(--line)] bg-[var(--chip-bg)] px-3 py-2 text-sm text-[var(--sea-ink)] focus:border-[var(--lagoon)] focus:outline-none"
          >
            <option value="all">All Categories</option>
            <option value="books">Books</option>
            <option value="tech">Tech</option>
            <option value="home">Home</option>
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-[var(--sea-ink-soft)]">
            Min Price
          </label>
          <input
            type="number"
            step="0.01"
            placeholder="Min"
            value={minPriceInput}
            onChange={(e) => setMinPriceInput(e.target.value)}
            className="w-full rounded-xl border border-[var(--line)] bg-[var(--chip-bg)] px-3 py-2 text-sm text-[var(--sea-ink)] focus:border-[var(--lagoon)] focus:outline-none"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-[var(--sea-ink-soft)]">
            Max Price
          </label>
          <input
            type="number"
            step="0.01"
            placeholder="Max"
            value={maxPriceInput}
            onChange={(e) => setMaxPriceInput(e.target.value)}
            className="w-full rounded-xl border border-[var(--line)] bg-[var(--chip-bg)] px-3 py-2 text-sm text-[var(--sea-ink)] focus:border-[var(--lagoon)] focus:outline-none"
          />
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            className="flex-1 rounded-xl bg-[var(--lagoon)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--lagoon-deep)] transition cursor-pointer"
          >
            Apply
          </button>
          <button
            type="button"
            onClick={handleClearFilters}
            className="rounded-xl border border-[var(--line)] bg-white/50 px-3 py-2 text-sm font-semibold text-[var(--sea-ink)] hover:bg-white transition cursor-pointer"
          >
            Clear
          </button>
        </div>
      </form>

      {/* Table Section */}
      <section className="island-shell rounded-2xl overflow-hidden p-0 mb-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr
                  key={headerGroup.id}
                  className="border-b border-[var(--line)] bg-[var(--chip-bg)]"
                >
                  {headerGroup.headers.map((header) => {
                    const isSortable = header.column.getCanSort()
                    const currentSort = header.column.getIsSorted()

                    return (
                      <th
                        key={header.id}
                        className={`p-4 text-xs font-bold uppercase tracking-wider text-[var(--sea-ink-soft)] ${
                          isSortable ? 'cursor-pointer select-none hover:text-[var(--sea-ink)]' : ''
                        }`}
                        onClick={
                          isSortable
                            ? header.column.getToggleSortingHandler()
                            : undefined
                        }
                      >
                        <div className="flex items-center gap-1">
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          {isSortable && (
                            <span className="text-[10px]">
                              {currentSort === 'asc'
                                ? '▲'
                                : currentSort === 'desc'
                                ? '▼'
                                : '↕'}
                            </span>
                          )}
                        </div>
                      </th>
                    )
                  })}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-[var(--line)] hover:bg-[rgba(255,255,255,0.3)] transition"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="p-4 text-sm text-[var(--sea-ink)]">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="p-8 text-center text-sm text-[var(--sea-ink-soft)]"
                  >
                    No products found matching the criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Pagination Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 island-shell rounded-2xl p-4">
        <div className="flex items-center gap-2 text-sm text-[var(--sea-ink-soft)]">
          <span>Show</span>
          <select
            value={table.getState().pagination.pageSize}
            onChange={(e) => {
              table.setPageSize(Number(e.target.value))
            }}
            className="rounded-xl border border-[var(--line)] bg-[var(--chip-bg)] px-2 py-1 text-sm text-[var(--sea-ink)] focus:outline-none"
          >
            {[5, 10, 20].map((pageSize) => (
              <option key={pageSize} value={pageSize}>
                {pageSize}
              </option>
            ))}
          </select>
          <span>per page</span>
        </div>

        <div className="text-sm text-[var(--sea-ink-soft)]">
          Showing{' '}
          <span className="font-semibold text-[var(--sea-ink)]">
            {data.total > 0 ? pagination.pageIndex * pagination.pageSize + 1 : 0}
          </span>{' '}
          to{' '}
          <span className="font-semibold text-[var(--sea-ink)]">
            {Math.min((pagination.pageIndex + 1) * pagination.pageSize, data.total)}
          </span>{' '}
          of{' '}
          <span className="font-semibold text-[var(--sea-ink)]">
            {data.total}
          </span>{' '}
          products
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="rounded-xl border border-[var(--line)] bg-white/50 px-3 py-1.5 text-sm font-semibold text-[var(--sea-ink)] hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
          >
            Previous
          </button>
          <span className="text-sm font-semibold text-[var(--sea-ink-soft)]">
            Page {search.page} of {table.getPageCount() || 1}
          </span>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="rounded-xl border border-[var(--line)] bg-white/50 px-3 py-1.5 text-sm font-semibold text-[var(--sea-ink)] hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
          >
            Next
          </button>
        </div>
      </div>
    </main>
  )
}
