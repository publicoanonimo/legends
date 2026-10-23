import { getFirestore } from 'firebase/firestore'
import { app } from './firebaseApp'

export const db = getFirestore(app)

// Load optional Firebase products only when the application starts using them.
export const getAuthService = async () => (await import('firebase/auth')).getAuth(app)
export const getStorageService = async () => (await import('firebase/storage')).getStorage(app)
export const getAnalyticsService = async () => {
  const { getAnalytics, isSupported } = await import('firebase/analytics')
  return (await isSupported()) ? getAnalytics(app) : null
}
