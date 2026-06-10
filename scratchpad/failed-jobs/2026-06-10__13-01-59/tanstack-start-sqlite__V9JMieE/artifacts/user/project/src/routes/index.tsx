import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { getCountServerFn, incrementCountServerFn } from '../server-fns/counter'

export const Route = createFileRoute('/')({
  loader: async () => {
    const count = await getCountServerFn()
    return { count }
  },
  component: CounterPage,
})

function CounterPage() {
  const { count: initialCount } = Route.useLoaderData()
  const [count, setCount] = useState(initialCount)

  const handleIncrement = async () => {
    const newCount = await incrementCountServerFn()
    setCount(newCount)
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <h1 className="text-3xl font-bold">Counter</h1>
      <p className="text-6xl font-mono" data-testid="count">
        {count}
      </p>
      <button
        data-testid="increment"
        onClick={handleIncrement}
        className="rounded-lg bg-blue-600 px-6 py-3 text-lg font-semibold text-white transition hover:bg-blue-700 active:scale-95"
      >
        Increment
      </button>
    </main>
  )
}
