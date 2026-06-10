import { createServerFn } from '@tanstack/react-start'

export interface DashboardMetrics {
  revenue: number
  users: number
}

export const getDashboardMetrics = createServerFn({ method: 'GET' }).handler(
  async (): Promise<DashboardMetrics> => {
    // Simulate a slow database query with a 2-second delay
    await new Promise((resolve) => setTimeout(resolve, 2000))

    return {
      revenue: 15000,
      users: 420,
    }
  },
)
