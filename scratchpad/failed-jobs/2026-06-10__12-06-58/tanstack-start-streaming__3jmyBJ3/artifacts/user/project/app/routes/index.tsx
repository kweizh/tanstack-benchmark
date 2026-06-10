import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: HomeComponent,
})

function HomeComponent() {
  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>TanStack Start — Streaming SSR Demo</h1>
      <p>
        <Link to="/dashboard">Go to Dashboard →</Link>
      </p>
    </div>
  )
}
