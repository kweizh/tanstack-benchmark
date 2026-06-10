import { z } from 'zod'

export const productSearchParamsSchema = z.object({
  q: z.string().optional().default(''),
  category: z.enum(['books', 'tech', 'home']).optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  sort: z.enum(['id', 'name', 'price', 'category']).optional().default('id'),
  order: z.enum(['asc', 'desc']).optional().default('asc'),
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).optional().default(5),
})

export type ProductSearchParams = z.infer<typeof productSearchParamsSchema>