import { createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { Suspense, use } from 'react'

// Server function that simulates a slow database query (2-second delay)
const getMetrics = createServerFn({ method: 'GET' }).handler(async () => {
  await new Promise((resolve) => setTimeout(resolve, 2000))
  return {
    revenue: 15000,
    users: 420,
  }
})

function MetricsDisplay({
  promise,
}: {
  promise: Promise<{ revenue: number; users: number }>
}) {
  const metrics = use(promise)
  return (
    <div>
      <p>Revenue: {metrics.revenue}</p>
      <p>Users: {metrics.users}</p>
    </div>
  )
}

export const Route = createFileRoute('/dashboard')({
  component: DashboardPage,
})

function DashboardPage() {
  const metricsPromise = getMetrics()

  return (
    <div>
      <h1>Dashboard</h1>
      <Suspense fallback={<div>Loading metrics...</div>}>
        <MetricsDisplay promise={metricsPromise} />
      </Suspense>
    </div>
  )
}
