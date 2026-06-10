import { Route as rootRoute } from './routes/__root'
import { Route as IndexRoute } from './routes/index'
import { Route as ProductsRoute } from './routes/products'

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/': {
      id: '__root__'
      path: ''
      fullPath: ''
      preLoaderRoute: typeof rootRoute
      parentRoute: typeof rootRoute
    }
    '/index': {
      id: '/'
      path: '/'
      fullPath: '/'
      preLoaderRoute: typeof IndexRoute
      parentRoute: typeof rootRoute
    }
    '/products': {
      id: '/products'
      path: '/products'
      fullPath: '/products'
      preLoaderRoute: typeof ProductsRoute
      parentRoute: typeof rootRoute
    }
  }
}

export const routeTree = rootRoute.addChildren([
  IndexRoute,
  ProductsRoute,
])

/* ROUTE_MANIFEST_START
{
  "routes": {
    "__root__": {
      "filePath": "routes/__root.tsx"
    },
    "/": {
      "filePath": "routes/index.tsx"
    },
    "/products": {
      "filePath": "routes/products.tsx"
    }
  }
}
ROUTE_MANIFEST_END */
