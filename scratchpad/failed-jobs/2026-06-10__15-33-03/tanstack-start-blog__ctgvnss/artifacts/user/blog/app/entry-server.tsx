import {
  createStartHandler,
} from '@tanstack/react-start/server'
import { getRouterManifest } from '@tanstack/react-start/router-manifest'
import { renderSSR } from '@tanstack/react-start/server'
import { router } from './router'

export default createStartHandler({
  createRouter: () => router,
  render: renderSSR,
  getRouterManifest,
})