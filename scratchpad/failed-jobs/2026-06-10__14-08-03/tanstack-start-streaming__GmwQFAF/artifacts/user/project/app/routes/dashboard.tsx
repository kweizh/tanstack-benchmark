import { createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import * as React from 'react'

const getMetrics = createServerFn({ method: 'GET' }).handler(async () => {
  await new Promise((resolve) => setTimeout(resolve, 2000))
  return { revenue: 15000, users: 420 }
})

export const Route = createFileRoute('/dashboard')({
  loader: () => ({ metricsPromise: getMetrics() }),
  component: Dashboard,
})

function Dashboard() {
  const { metricsPromise } = Route.useLoaderData()
  return (
    <div>
      <h1>Dashboard</h1>
      <React.Suspense fallback={<div>Loading metrics...</div>}>
        <Metrics metricsPromise={metricsPromise} />
      </React.Suspense>
    </div>
  )
}

function Metrics({ metricsPromise }: { metricsPromise: Promise<{ revenue: number; users: number }> }) {
  const metrics = React.use(metricsPromise)
  return (
    <div>
      <p>Revenue: {metrics.revenue}</p>
      <p>Users: {metrics.users}</p>
    </div>
  )
}
