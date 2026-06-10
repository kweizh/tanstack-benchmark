import type { Plugin } from 'vite'
import express from 'express'

let posts = [{ id: '1', title: 'Test Post', likes: 0 }]

export function apiPlugin(): Plugin {
  return {
    name: 'vite-api-plugin',
    configureServer(server) {
      server.middlewares.use(express.json())
      
      server.middlewares.use((req: any, res: any, next) => {
        if (req.method === 'POST' && req.url?.match(/^\/api\/posts\/[^\/]+\/like$/)) {
          if (req.body && req.body.fail) {
            res.statusCode = 500
            res.end(JSON.stringify({ error: 'Failed' }))
            return
          }
          posts[0].likes += 1
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify(posts[0]))
          return
        }
        next()
      })

      server.middlewares.use('/api/posts', (req: any, res: any, next) => {
        if (req.method === 'GET') {
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify(posts))
          return
        }
        next()
      })
    }
  }
}
