import { createFileRoute, Await } from '@tanstack/react-router'
import { Suspense } from 'react'
import { getDashboardMetrics } from '#/lib/dashboard'

export const Route = createFileRoute('/dashboard')({
  loader: () => {
    // Return the promise without awaiting it so it can be streamed
    const metricsPromise = getDashboardMetrics()
    return { metricsPromise }
  },
  component: Dashboard,
})

function Dashboard() {
  const { metricsPromise } = Route.useLoaderData()

  return (
    <main className="page-wrap px-4 pb-8 pt-14">
      <section className="island-shell rise-in relative overflow-hidden rounded-[2rem] px-6 py-10 sm:px-10 sm:py-14">
        <div className="pointer-events-none absolute -left-20 -top-24 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(79,184,178,0.32),transparent_66%)]" />
        <div className="pointer-events-none absolute -bottom-20 -right-20 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(47,106,74,0.18),transparent_66%)]" />
        <h1 className="display-title mb-5 max-w-3xl text-4xl leading-[1.02] font-bold tracking-tight text-[var(--sea-ink)] sm:text-6xl">
          Dashboard
        </h1>

        <Suspense fallback={<p className="text-base text-[var(--sea-ink-soft)]">Loading metrics...</p>}>
          <Await promise={metricsPromise}>
            {(metrics) => (
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="island-shell feature-card rounded-2xl p-6">
                  <p className="island-kicker mb-2">Revenue</p>
                  <p className="text-3xl font-bold text-[var(--sea-ink)]">
                    ${metrics.revenue.toLocaleString()}
                  </p>
                </div>
                <div className="island-shell feature-card rounded-2xl p-6">
                  <p className="island-kicker mb-2">Users</p>
                  <p className="text-3xl font-bold text-[var(--sea-ink)]">
                    {metrics.users.toLocaleString()}
                  </p>
                </div>
              </div>
            )}
          </Await>
        </Suspense>
      </section>
    </main>
  )
}
