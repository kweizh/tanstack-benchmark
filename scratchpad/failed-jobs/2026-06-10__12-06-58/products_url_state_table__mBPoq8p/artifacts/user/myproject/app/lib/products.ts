import type { ProductSearch } from "./schema";

export type Product = {
  id: number;
  name: string;
  category: "books" | "tech" | "home";
  price: number;
};

export const PRODUCTS: Product[] = [
  { id: 1, name: "JavaScript Programming", category: "books", price: 35.50 },
  { id: 2, name: "The Pragmatic Programmer", category: "books", price: 42.00 },
  { id: 3, name: "Design Patterns", category: "books", price: 55.00 },
  { id: 4, name: "Clean Code", category: "books", price: 39.99 },
  { id: 5, name: "Wireless Mouse", category: "tech", price: 25.00 },
  { id: 6, name: "Mechanical Keyboard", category: "tech", price: 89.99 },
  { id: 7, name: "USB-C Hub", category: "tech", price: 49.50 },
  { id: 8, name: "4K Monitor", category: "tech", price: 320.00 },
  { id: 9, name: "Coffee Maker", category: "home", price: 75.00 },
  { id: 10, name: "Vacuum Cleaner", category: "home", price: 145.00 },
  { id: 11, name: "Desk Lamp", category: "home", price: 32.00 },
  { id: 12, name: "Throw Pillow", category: "home", price: 18.99 },
];

export type ProductsResult = {
  rows: Product[];
  total: number;
  page: number;
  pageSize: number;
};

export function queryProducts(params: ProductSearch): ProductsResult {
  const { q, category, minPrice, maxPrice, sort, order, page, pageSize } = params;

  let filtered = PRODUCTS.slice();

  if (q) {
    const lower = q.toLowerCase();
    filtered = filtered.filter((p) => p.name.toLowerCase().includes(lower));
  }

  if (category) {
    filtered = filtered.filter((p) => p.category === category);
  }

  if (minPrice !== undefined) {
    filtered = filtered.filter((p) => p.price >= minPrice);
  }

  if (maxPrice !== undefined) {
    filtered = filtered.filter((p) => p.price <= maxPrice);
  }

  // Sort
  filtered.sort((a, b) => {
    let cmp = 0;
    if (sort === "id") {
      cmp = a.id - b.id;
    } else if (sort === "name") {
      cmp = a.name.localeCompare(b.name);
    } else if (sort === "price") {
      cmp = a.price - b.price;
    } else if (sort === "category") {
      cmp = a.category.localeCompare(b.category);
    }
    return order === "desc" ? -cmp : cmp;
  });

  const total = filtered.length;
  const start = (page - 1) * pageSize;
  const rows = filtered.slice(start, start + pageSize);

  return { rows, total, page, pageSize };
}
