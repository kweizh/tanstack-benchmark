import {
  createRequestHandler,
  defaultStreamHandler,
} from '@tanstack/react-router/ssr/server'
import { getRouter as createRouter } from './router'

export async function render({ request }: { request: Request }) {
  // Clone the request and set User-Agent to a browser header to bypass bot detection
  // and force streaming for all clients (including curl and test runners)
  const headers = new Headers(request.headers)
  headers.set(
    'User-Agent',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  )
  const clonedRequest = new Request(request, { headers })

  const handler = createRequestHandler({ request: clonedRequest, createRouter })
  return await handler(defaultStreamHandler)
}
