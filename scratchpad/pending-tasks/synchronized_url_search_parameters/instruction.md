TanStack Router allows deep integration with validation libraries like Zod to manage complex, type-safe filtering states directly in the URL search params.

You need to create a file route definition for `/products` that strictly types and validates URL search parameters (`category` as a string, `inStock` as a boolean) using the `validateSearch` option. 

**Constraints:**
- Must use Zod (`z.object`) to validate the search parameters.
- Must provide fallback default values (`category` defaults to `"all"`, `inStock` defaults to `true`) if the parameters are omitted from the URL.
- Do NOT generate the `routeTree.gen.ts` file manually.