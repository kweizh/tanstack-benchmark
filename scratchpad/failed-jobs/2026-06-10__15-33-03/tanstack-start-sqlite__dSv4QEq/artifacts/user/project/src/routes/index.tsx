import { createFileRoute, useRouter } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { getCount, incrementCount } from '../db'

// Server Function to read the current counter value
const getCountFn = createServerFn({ method: 'GET' }).handler(() => {
  return getCount()
})

// Server Function to increment the counter value
const incrementCountFn = createServerFn({ method: 'POST' }).handler(() => {
  return incrementCount()
})

export const Route = createFileRoute('/')({
  component: Home,
  loader: async () => {
    const count = await getCountFn()
    return { count }
  },
})

function Home() {
  const router = useRouter()
  const { count } = Route.useLoaderData()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>
      <h1>Counter App</h1>
      <p data-testid="count" style={{ fontSize: '2rem', margin: '1rem 0' }}>
        Count: {count}
      </p>
      <button
        data-testid="increment"
        onClick={() => {
          incrementCountFn().then(() => {
            router.invalidate()
          })
        }}
        style={{
          fontSize: '1.2rem',
          padding: '0.5rem 2rem',
          cursor: 'pointer',
          borderRadius: '8px',
          border: '1px solid #ccc',
          backgroundColor: '#007bff',
          color: 'white',
        }}
      >
        Increment
      </button>
    </div>
  )
}