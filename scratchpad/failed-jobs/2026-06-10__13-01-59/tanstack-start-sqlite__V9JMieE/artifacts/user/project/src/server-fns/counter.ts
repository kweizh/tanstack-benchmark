import { createServerFn } from '@tanstack/react-start'
import { getCount, incrementCount } from '../db'

export const getCountServerFn = createServerFn({
  method: 'GET',
}).handler(async () => {
  return getCount()
})

export const incrementCountServerFn = createServerFn({
  method: 'POST',
}).handler(async () => {
  return incrementCount()
})
