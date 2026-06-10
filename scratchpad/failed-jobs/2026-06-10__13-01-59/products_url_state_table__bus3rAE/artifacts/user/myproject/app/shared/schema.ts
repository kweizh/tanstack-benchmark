import { z } from 'zod'

export const productSearchSchema = z.object({
  q: z.string().optional(),
  category: z.enum(['books', 'tech', 'home']).optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  sort: z.enum(['id', 'name', 'price', 'category']).default('id'),
  order: z.enum(['asc', 'desc']).default('asc'),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).default(5),
})

export type ProductSearch = z.infer<typeof productSearchSchema>
