import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  return (
    <div>
      <h1>Home</h1>
      <Link to="/dashboard">Go to Dashboard</Link>
    </div>
  )
}
