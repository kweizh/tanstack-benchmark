import { createFileRoute } from '@tanstack/react-router'
import { productSearchParamsSchema } from '#/lib/schema'
import { filterProducts } from '#/lib/products'

export const Route = createFileRoute('/api/products')({
  beforeLoad: ({ request }) => {
    const url = new URL(request.url)
    const params = Object.fromEntries(url.searchParams.entries())

    const result = productSearchParamsSchema.safeParse(params)

    if (!result.success) {
      const firstError = result.error.issues[0]
      const message = firstError
        ? `${firstError.path.join('.')}: ${firstError.message}`
        : 'Invalid parameters'
      return new Response(JSON.stringify({ error: message }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const data = filterProducts(result.data)

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  },
})