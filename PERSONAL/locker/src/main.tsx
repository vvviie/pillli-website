import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import '@fontsource/fraunces/latin-600.css'
import '@fontsource/source-sans-3/latin-400.css'
import '@fontsource/source-sans-3/latin-600.css'
import '@fontsource/source-sans-3/latin-700.css'
import './styles/base.css'
import './styles/gate.css'
import './styles/shell.css'
import './styles/notes.css'
import { App } from './App.tsx'

window.addEventListener('error', (event) => console.error('Uncaught error', event.error))
window.addEventListener('unhandledrejection', (event) => console.error('Unhandled rejection', event.reason))

if (import.meta.env.PROD) registerSW({ immediate: true })

const root = document.getElementById('root')
if (!root) throw new Error('Locker could not find its root element.')

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
