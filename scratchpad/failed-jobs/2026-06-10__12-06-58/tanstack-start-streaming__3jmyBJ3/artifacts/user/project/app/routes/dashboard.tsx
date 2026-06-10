import { createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/start'
import { Suspense, use } from 'react'

// Server function that simulates a slow DB query (2-second delay)
const fetchMetrics = createServerFn({ method: 'GET' }).handler(async () => {
  await new Promise((resolve) => setTimeout(resolve, 2000))
  return {
    revenue: 15000,
    users: 420,
  }
})

export const Route = createFileRoute('/dashboard')({
  component: DashboardPage,
})

// Start the fetch at route render time so it can stream in
function DashboardPage() {
  const metricsPromise = fetchMetrics()

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Dashboard</h1>
      <p>Metrics are loading via streaming SSR…</p>
      <Suspense fallback={<p>Loading metrics...</p>}>
        <MetricsCard metricsPromise={metricsPromise} />
      </Suspense>
    </div>
  )
}

function MetricsCard({
  metricsPromise,
}: {
  metricsPromise: Promise<{ revenue: number; users: number }>
}) {
  const metrics = use(metricsPromise)

  return (
    <div
      style={{
        display: 'flex',
        gap: '1.5rem',
        marginTop: '1rem',
      }}
    >
      <div
        style={{
          padding: '1.5rem',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          minWidth: '160px',
        }}
      >
        <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748b' }}>
          Revenue
        </p>
        <p
          style={{
            margin: '0.25rem 0 0',
            fontSize: '2rem',
            fontWeight: 700,
          }}
        >
          ${metrics.revenue.toLocaleString()}
        </p>
      </div>
      <div
        style={{
          padding: '1.5rem',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          minWidth: '160px',
        }}
      >
        <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748b' }}>
          Users
        </p>
        <p
          style={{
            margin: '0.25rem 0 0',
            fontSize: '2rem',
            fontWeight: 700,
          }}
        >
          {metrics.users.toLocaleString()}
        </p>
      </div>
    </div>
  )
}
