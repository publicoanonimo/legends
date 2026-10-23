import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './styles.css'

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
