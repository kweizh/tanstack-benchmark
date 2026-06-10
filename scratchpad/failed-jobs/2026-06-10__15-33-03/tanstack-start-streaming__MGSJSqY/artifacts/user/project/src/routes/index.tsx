import { createFileRoute } from '@tanstack/react-router'
import { Link } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  return (
    <div>
      <h1>Home</h1>
      <Link to="/dashboard">Go to Dashboard</Link>
    </div>
  )
}
