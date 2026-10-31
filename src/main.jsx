import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './styles.css'

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((error) => {
      console.error('No se pudo registrar el acceso instalable:', error)
    })
  })
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

const scheduleAnalytics = () => {
  import('./firebaseAnalytics')
    .then(({ initializeAnalytics }) => initializeAnalytics())
    .catch(() => {})
}

if ('requestIdleCallback' in window) {
  window.requestIdleCallback(scheduleAnalytics, { timeout: 5000 })
} else {
  window.setTimeout(scheduleAnalytics, 1500)
}
