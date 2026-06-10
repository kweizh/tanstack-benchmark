import { Await, createFileRoute, defer } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { Suspense } from 'react'

const getMetrics = createServerFn({ method: 'GET' }).handler(async () => {
  await new Promise((resolve) => setTimeout(resolve, 2000))
  return { revenue: 15000, users: 420 }
})

export const Route = createFileRoute('/dashboard')({
  loader: () => {
    return {
      metricsPromise: defer(getMetrics()),
    }
  },
  component: DashboardComponent,
})

function DashboardComponent() {
  const { metricsPromise } = Route.useLoaderData()

  return (
    <div className="p-4">
      <h1>Dashboard</h1>
      <Suspense fallback={<div>Loading metrics...</div>}>
        <Await
          promise={metricsPromise}
          children={(metrics) => (
            <div>
              <div data-testid="revenue">Revenue: {metrics.revenue}</div>
              <div data-testid="users">Users: {metrics.users}</div>
            </div>
          )}
        />
      </Suspense>
    </div>
  )
}
