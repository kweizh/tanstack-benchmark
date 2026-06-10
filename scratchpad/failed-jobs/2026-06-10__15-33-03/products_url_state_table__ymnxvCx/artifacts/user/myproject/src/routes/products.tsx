import { createFileRoute } from '@tanstack/react-router'
import { productSearchParamsSchema } from '#/lib/schema'
import { type Product } from '#/lib/products'
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type PaginationState,
} from '@tanstack/react-table'
import { useState, useMemo } from 'react'

export const Route = createFileRoute('/products')({
  validateSearch: productSearchParamsSchema,
  loader: async ({ search }) => {
    const params = new URLSearchParams()
    if (search.q) params.set('q', search.q)
    if (search.category) params.set('category', search.category)
    if (search.minPrice !== undefined) params.set('minPrice', String(search.minPrice))
    if (search.maxPrice !== undefined) params.set('maxPrice', String(search.maxPrice))
    params.set('sort', search.sort)
    params.set('order', search.order)
    params.set('page', String(search.page))
    params.set('pageSize', String(search.pageSize))

    const res = await fetch(`/api/products?${params.toString()}`)
    const data = await res.json()
    return data as { rows: Product[]; total: number; page: number; pageSize: number }
  },
  component: ProductsPage,
})

function ProductsPage() {
  const search = Route.useSearch()
  const loaderData = Route.useLoaderData()
  const navigate = Route.useNavigate()

  const columns = useMemo<ColumnDef<Product>[]>(
    () => [
      { accessorKey: 'id', header: 'ID', cell: (info) => info.getValue() },
      { accessorKey: 'name', header: 'Name', cell: (info) => info.getValue() },
      { accessorKey: 'category', header: 'Category', cell: (info) => info.getValue() },
      {
        accessorKey: 'price',
        header: 'Price',
        cell: (info) => `$${Number(info.getValue()).toFixed(2)}`,
      },
    ],
    []
  )

  const pageCount = Math.ceil(loaderData.total / search.pageSize)

  const [sorting, setSorting] = useState<SortingState>([
    { id: search.sort, desc: search.order === 'desc' },
  ])

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: search.page - 1,
    pageSize: search.pageSize,
  })

  const [globalFilter, setGlobalFilter] = useState(search.q || '')

  const table = useReactTable({
    data: loaderData.rows,
    columns,
    pageCount,
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    state: {
      sorting,
      pagination,
      globalFilter,
    },
    onSortingChange: (updater) => {
      const newSorting = typeof updater === 'function' ? updater(sorting) : updater
      setSorting(newSorting)
      const sortCol = newSorting[0]?.id || 'id'
      const order = newSorting[0]?.desc ? 'desc' : 'asc'
      navigate({
        search: (prev: Record<string, unknown>) => ({
          ...prev,
          sort: sortCol,
          order,
          page: 1,
        }),
      })
    },
    onPaginationChange: (updater) => {
      const newPagination = typeof updater === 'function' ? updater(pagination) : updater
      setPagination(newPagination)
      navigate({
        search: (prev: Record<string, unknown>) => ({
          ...prev,
          page: newPagination.pageIndex + 1,
          pageSize: newPagination.pageSize,
        }),
      })
    },
    onGlobalFilterChange: (value) => {
      setGlobalFilter(value)
      navigate({
        search: (prev: Record<string, unknown>) => ({
          ...prev,
          q: value || undefined,
          page: 1,
        }),
      })
    },
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  return (
    <main className="page-wrap px-4 pb-8 pt-14">
      <section className="island-shell rise-in rounded-2xl p-6">
        <p className="island-kicker mb-2">Products</p>
        <h1 className="display-title mb-5 text-3xl font-bold tracking-tight text-[var(--sea-ink)]">
          Product Catalog
        </h1>

        {/* Filters */}
        <div className="mb-4 flex flex-wrap gap-3">
          <input
            type="text"
            placeholder="Search by name..."
            value={globalFilter}
            onChange={(e) => table.setGlobalFilter(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
          <select
            value={search.category || ''}
            onChange={(e) => {
              const val = e.target.value as 'books' | 'tech' | 'home' | ''
              navigate({
                search: (prev: Record<string, unknown>) => ({
                  ...prev,
                  category: val || undefined,
                  page: 1,
                }),
              })
            }}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="">All Categories</option>
            <option value="books">Books</option>
            <option value="tech">Tech</option>
            <option value="home">Home</option>
          </select>
          <input
            type="number"
            placeholder="Min price"
            value={search.minPrice ?? ''}
            onChange={(e) => {
              const val = e.target.value ? Number(e.target.value) : undefined
              navigate({
                search: (prev: Record<string, unknown>) => ({
                  ...prev,
                  minPrice: val,
                  page: 1,
                }),
              })
            }}
            className="w-24 rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
          <input
            type="number"
            placeholder="Max price"
            value={search.maxPrice ?? ''}
            onChange={(e) => {
              const val = e.target.value ? Number(e.target.value) : undefined
              navigate({
                search: (prev: Record<string, unknown>) => ({
                  ...prev,
                  maxPrice: val,
                  page: 1,
                }),
              })
            }}
            className="w-24 rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="cursor-pointer px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <div className="flex items-center gap-1">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {{
                          asc: ' ↑',
                          desc: ' ↓',
                        }[header.column.getIsSorted() as string] ?? ''}
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="whitespace-nowrap px-4 py-3 text-sm text-gray-700"
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination info */}
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Showing {loaderData.rows.length} of {loaderData.total} results (Page{' '}
            {search.page})
          </p>
          <div className="flex gap-2">
            <button
              className="rounded-lg border border-gray-300 px-3 py-1 text-sm disabled:opacity-50"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </button>
            <button
              className="rounded-lg border border-gray-300 px-3 py-1 text-sm disabled:opacity-50"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </button>
          </div>
        </div>
      </section>
    </main>
  )
}