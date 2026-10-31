import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './styles.css'

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => Promise.all(
    registrations.filter((registration) => [registration.active, registration.waiting, registration.installing]
      .some((worker) => worker?.scriptURL.endsWith('/sw.js')))
      .map((registration) => registration.unregister()),
  )).catch(() => {})
  if ('caches' in window) window.caches.delete('the-legends-shell-v1').catch(() => {})
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
