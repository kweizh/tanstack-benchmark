import { z } from 'zod'

export const productCategories = ['books', 'tech', 'home'] as const
export type ProductCategory = (typeof productCategories)[number]

export interface Product {
  id: number
  name: string
  category: ProductCategory
  price: number
}

export const seedProducts: Product[] = [
  { id: 1, name: 'JavaScript Programming', category: 'books', price: 35.50 },
  { id: 2, name: 'The Pragmatic Programmer', category: 'books', price: 42.00 },
  { id: 3, name: 'Design Patterns', category: 'books', price: 55.00 },
  { id: 4, name: 'Clean Code', category: 'books', price: 39.99 },
  { id: 5, name: 'Wireless Mouse', category: 'tech', price: 25.00 },
  { id: 6, name: 'Mechanical Keyboard', category: 'tech', price: 89.99 },
  { id: 7, name: 'USB-C Hub', category: 'tech', price: 49.50 },
  { id: 8, name: '4K Monitor', category: 'tech', price: 320.00 },
  { id: 9, name: 'Coffee Maker', category: 'home', price: 75.00 },
  { id: 10, name: 'Vacuum Cleaner', category: 'home', price: 145.00 },
  { id: 11, name: 'Desk Lamp', category: 'home', price: 32.00 },
  { id: 12, name: 'Throw Pillow', category: 'home', price: 18.99 },
]

// Zod schema for search params
export const productsSearchSchema = z.object({
  q: z.string().optional(),
  category: z.enum(productCategories).optional(),
  minPrice: z
    .preprocess((val) => {
      if (val === undefined || val === '') return undefined
      const num = Number(val)
      return isNaN(num) ? val : num
    }, z.number({ invalid_type_error: 'minPrice must be a number' }))
    .optional(),
  maxPrice: z
    .preprocess((val) => {
      if (val === undefined || val === '') return undefined
      const num = Number(val)
      return isNaN(num) ? val : num
    }, z.number({ invalid_type_error: 'maxPrice must be a number' }))
    .optional(),
  sort: z.enum(['id', 'name', 'price', 'category']).optional().default('id'),
  order: z.enum(['asc', 'desc']).optional().default('asc'),
  page: z
    .preprocess((val) => {
      if (val === undefined || val === '') return undefined
      const num = Number(val)
      return isNaN(num) ? val : num
    }, z.number({ invalid_type_error: 'page must be an integer' }).int('page must be an integer').min(1, 'page must be at least 1'))
    .optional()
    .default(1),
  pageSize: z
    .preprocess((val) => {
      if (val === undefined || val === '') return undefined
      const num = Number(val)
      return isNaN(num) ? val : num
    }, z.number({ invalid_type_error: 'pageSize must be an integer' }).int('pageSize must be an integer').min(1, 'pageSize must be at least 1'))
    .optional()
    .default(5),
})

export type ProductsSearchInput = z.infer<typeof productsSearchSchema>
