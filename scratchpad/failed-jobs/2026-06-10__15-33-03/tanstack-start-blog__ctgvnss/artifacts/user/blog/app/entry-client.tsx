import { StartClient } from '@tanstack/react-start'
import { hydrateRoot } from 'react-dom/client'
import { router } from './router'

hydrateRoot(document.getElementById('root')!, <StartClient router={router} />)