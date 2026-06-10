import { createServer } from 'http'

// The PORT can be configured via the environment variable or defaults to 4821
const PORT = parseInt(process.env.PORT || '4821', 10)

// Import the built server handler
const { default: app } = await import('./dist/server/server.js')

const server = createServer(async (req, res) => {
  // Convert Node.js request to Web API Request
  const protocol = 'http'
  const host = req.headers.host || `localhost:${PORT}`
  const url = `${protocol}://${host}${req.url}`

  const headers = new Headers()
  for (const [key, value] of Object.entries(req.headers)) {
    if (value !== undefined) {
      if (Array.isArray(value)) {
        value.forEach((v) => headers.append(key, v))
      } else {
        headers.set(key, value)
      }
    }
  }

  // Collect body for non-GET/HEAD requests
  let body = null
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    const chunks = []
    for await (const chunk of req) {
      chunks.push(chunk)
    }
    if (chunks.length > 0) {
      body = Buffer.concat(chunks)
    }
  }

  const request = new Request(url, {
    method: req.method,
    headers,
    body,
    duplex: 'half',
  })

  try {
    const response = await app.fetch(request)

    res.statusCode = response.status
    res.statusMessage = response.statusText

    for (const [key, value] of response.headers.entries()) {
      res.setHeader(key, value)
    }

    if (response.body) {
      const reader = response.body.getReader()
      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          res.write(value)
        }
      } finally {
        reader.releaseLock()
      }
    }

    res.end()
  } catch (err) {
    console.error('Server error:', err)
    res.statusCode = 500
    res.end('Internal Server Error')
  }
})

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`)
})
