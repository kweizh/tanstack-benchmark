export interface Product {
  id: number
  name: string
  category: 'books' | 'tech' | 'home'
  price: number
}

export const SEED_PRODUCTS: Product[] = [
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
