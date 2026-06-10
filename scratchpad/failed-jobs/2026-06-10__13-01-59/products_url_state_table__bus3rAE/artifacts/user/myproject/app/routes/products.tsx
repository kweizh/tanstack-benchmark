import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { productSearchSchema } from '../shared/schema'
import type { Product } from '../shared/products'
import { useMemo } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  createColumnHelper,
  flexRender,
  type PaginationState,
  type SortingState,
  type ColumnFiltersState,
} from '@tanstack/react-table'

export const Route = createFileRoute('/products')({
  validateSearch: productSearchSchema,
  loaderDeps: ({ search }) => search,
  loader: async ({ deps }) => {
    const params = new URLSearchParams()
    if (deps.q) params.set('q', deps.q)
    if (deps.category) params.set('category', deps.category)
    if (deps.minPrice !== undefined) params.set('minPrice', String(deps.minPrice))
    if (deps.maxPrice !== undefined) params.set('maxPrice', String(deps.maxPrice))
    params.set('sort', deps.sort)
    params.set('order', deps.order)
    params.set('page', String(deps.page))
    params.set('pageSize', String(deps.pageSize))

    const url = `http://localhost:42101/api/products?${params.toString()}`
    const res = await fetch(url)
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error || 'Failed to fetch products')
    }
    return res.json() as Promise<{
      rows: Product[]
      total: number
      page: number
      pageSize: number
    }>
  },
  component: ProductsPage,
})

const columnHelper = createColumnHelper<Product>()

const columns = [
  columnHelper.accessor('id', {
    header: 'ID',
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor('name', {
    header: 'Name',
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor('category', {
    header: 'Category',
    cell: (info) => info.getValue(),
    filterFn: 'equals',
  }),
  columnHelper.accessor('price', {
    header: 'Price',
    cell: (info) => `$${info.getValue().toFixed(2)}`,
  }),
]

function ProductsPage() {
  const data = Route.useLoaderData()
  const search = Route.useSearch()
  const navigate = useNavigate({ from: '/products' })

  const pageCount = useMemo(
    () => Math.max(1, Math.ceil(data.total / data.pageSize)),
    [data.total, data.pageSize],
  )

  const pagination: PaginationState = useMemo(
    () => ({
      pageIndex: search.page - 1,
      pageSize: search.pageSize,
    }),
    [search.page, search.pageSize],
  )

  const sorting: SortingState = useMemo(
    () => [{ id: search.sort, desc: search.order === 'desc' }],
    [search.sort, search.order],
  )

  const columnFilters: ColumnFiltersState = useMemo(() => {
    const filters: ColumnFiltersState = []
    if (search.category) {
      filters.push({ id: 'category', value: search.category })
    }
    return filters
  }, [search.category])

  const globalFilter = search.q ?? ''

  const table = useReactTable({
    data: data.rows,
    columns,
    pageCount,
    state: {
      pagination,
      sorting,
      columnFilters,
      globalFilter,
    },
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    onPaginationChange: (updater) => {
      const newState =
        typeof updater === 'function'
          ? updater(pagination)
          : updater
      navigate({
        search: (prev) => ({
          ...prev,
          page: newState.pageIndex + 1,
          pageSize: newState.pageSize,
        }),
      })
    },
    onSortingChange: (updater) => {
      const newState =
        typeof updater === 'function'
          ? updater(sorting)
          : updater
      const newSort = newState.length > 0 ? newState[0] : { id: 'id', desc: false }
      navigate({
        search: (prev) => ({
          ...prev,
          sort: newSort.id as 'id' | 'name' | 'price' | 'category',
          order: newSort.desc ? 'desc' : 'asc',
        }),
      })
    },
    onGlobalFilterChange: (value) => {
      navigate({
        search: (prev) => ({
          ...prev,
          q: value || undefined,
        }),
      })
    },
    onColumnFiltersChange: (updater) => {
      const newFilters =
        typeof updater === 'function'
          ? updater(columnFilters)
          : updater
      const catFilter = newFilters.find((f) => f.id === 'category')
      navigate({
        search: (prev) => ({
          ...prev,
          category: (catFilter?.value as 'books' | 'tech' | 'home' | undefined) || undefined,
        }),
      })
    },
    getCoreRowModel: getCoreRowModel(),
    enableGlobalFilter: true,
    globalFilterFn: 'includesString',
  })

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Products</h1>

      <div style={{ marginBottom: '16px', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div>
          <label htmlFor="search">Search: </label>
          <input
            id="search"
            type="text"
            value={globalFilter}
            onChange={(e) => table.setGlobalFilter(e.target.value)}
            placeholder="Search by name..."
          />
        </div>

        <div>
          <label htmlFor="category">Category: </label>
          <select
            id="category"
            value={search.category ?? ''}
            onChange={(e) => {
              const val = e.target.value
              table.setColumnFilters(
                val ? [{ id: 'category', value: val }] : [],
              )
            }}
          >
            <option value="">All</option>
            <option value="books">Books</option>
            <option value="tech">Tech</option>
            <option value="home">Home</option>
          </select>
        </div>

        <div>
          <button
            onClick={() => {
              navigate({ search: { page: 1, pageSize: 5, sort: 'id', order: 'asc' } })
            }}
          >
            Reset Filters
          </button>
        </div>
      </div>

      <table style={{ borderCollapse: 'collapse', width: '100%', maxWidth: '800px' }}>
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  style={{
                    borderBottom: '2px solid #ccc',
                    padding: '8px 12px',
                    textAlign: 'left',
                    cursor: header.column.getCanSort() ? 'pointer' : 'default',
                  }}
                  onClick={header.column.getToggleSortingHandler()}
                >
                  {flexRender(header.column.columnDef.header, header.getContext())}
                  {{
                    asc: ' 🔼',
                    desc: ' 🔽',
                  }[header.column.getIsSorted() as string] ?? ''}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <td
                  key={cell.id}
                  style={{
                    borderBottom: '1px solid #eee',
                    padding: '8px 12px',
                  }}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ marginTop: '16px', display: 'flex', gap: '8px', alignItems: 'center' }}>
        <button
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </button>
        <span>
          Page {search.page} of {pageCount} (Total: {data.total})
        </span>
        <button
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </button>
        <span style={{ marginLeft: '16px' }}>
          Page Size:{' '}
          <select
            value={search.pageSize}
            onChange={(e) => {
              table.setPageSize(Number(e.target.value))
            }}
          >
            {[5, 10, 20].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </span>
      </div>
    </div>
  )
}
