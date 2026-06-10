import { createAPIFileRoute } from '@tanstack/react-start/api'
import { seedProducts, productsSearchSchema } from '../../products-schema'

export const APIRoute = createAPIFileRoute('/api/products')({
  GET: async ({ request }) => {
    const url = new URL(request.url)
    const searchParams = Object.fromEntries(url.searchParams.entries())

    const result = productsSearchSchema.safeParse(searchParams)

    if (!result.success) {
      const errorMessage = result.error.errors.map((err) => err.message).join(', ')
      return Response.json({ error: errorMessage }, { status: 400 })
    }

    const { q, category, minPrice, maxPrice, sort, order, page, pageSize } = result.data

    let filtered = [...seedProducts]

    // Filtering
    if (q) {
      const query = q.toLowerCase()
      filtered = filtered.filter((p) => p.name.toLowerCase().includes(query))
    }

    if (category) {
      filtered = filtered.filter((p) => p.category === category)
    }

    if (minPrice !== undefined) {
      filtered = filtered.filter((p) => p.price >= minPrice)
    }

    if (maxPrice !== undefined) {
      filtered = filtered.filter((p) => p.price <= maxPrice)
    }

    const total = filtered.length

    // Sorting
    filtered.sort((a, b) => {
      const valA = a[sort]
      const valB = b[sort]

      let comparison = 0
      if (typeof valA === 'string' && typeof valB === 'string') {
        comparison = valA.localeCompare(valB)
      } else {
        comparison = (valA as number) - (valB as number)
      }

      return order === 'asc' ? comparison : -comparison
    })

    // Pagination
    const startIndex = (page - 1) * pageSize
    const endIndex = startIndex + pageSize
    const rows = filtered.slice(startIndex, endIndex)

    return Response.json({
      rows,
      total,
      page,
      pageSize,
    })
  },
})
