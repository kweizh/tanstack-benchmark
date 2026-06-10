import { createAPIFileRoute } from '@tanstack/start-api-routes'
import { productSearchSchema } from '../../shared/schema'
import { SEED_PRODUCTS } from '../../shared/products'
import type { Product } from '../../shared/products'

function filterAndSortAndPaginate(params: {
  q?: string
  category?: 'books' | 'tech' | 'home'
  minPrice?: number
  maxPrice?: number
  sort: 'id' | 'name' | 'price' | 'category'
  order: 'asc' | 'desc'
  page: number
  pageSize: number
}): { rows: Product[]; total: number } {
  let filtered = [...SEED_PRODUCTS]

  // Apply filters
  if (params.q) {
    const q = params.q.toLowerCase()
    filtered = filtered.filter((p) => p.name.toLowerCase().includes(q))
  }

  if (params.category) {
    filtered = filtered.filter((p) => p.category === params.category)
  }

  if (params.minPrice !== undefined && !isNaN(params.minPrice)) {
    filtered = filtered.filter((p) => p.price >= params.minPrice!)
  }

  if (params.maxPrice !== undefined && !isNaN(params.maxPrice)) {
    filtered = filtered.filter((p) => p.price <= params.maxPrice!)
  }

  // Apply sorting
  const sortField = params.sort
  const order = params.order === 'desc' ? -1 : 1

  filtered.sort((a, b) => {
    const aVal = a[sortField]
    const bVal = b[sortField]

    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return aVal.localeCompare(bVal) * order
    }
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return (aVal - bVal) * order
    }
    return 0
  })

  const total = filtered.length

  // Apply pagination
  const start = (params.page - 1) * params.pageSize
  const rows = filtered.slice(start, start + params.pageSize)

  return { rows, total }
}

export const APIRoute = createAPIFileRoute('/api/products')({
  GET: async ({ request }) => {
    const url = new URL(request.url)
    const rawParams: Record<string, string> = {}
    url.searchParams.forEach((value, key) => {
      rawParams[key] = value
    })

    const parsed = productSearchSchema.safeParse(rawParams)

    if (!parsed.success) {
      const errorMessages = parsed.error.errors
        .map((e) => e.message)
        .join(', ')
      return new Response(
        JSON.stringify({ error: errorMessages }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        },
      )
    }

    const params = parsed.data
    const { rows, total } = filterAndSortAndPaginate(params)

    return new Response(
      JSON.stringify({
        rows,
        total,
        page: params.page,
        pageSize: params.pageSize,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      },
    )
  },
})
