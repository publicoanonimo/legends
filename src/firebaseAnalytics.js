import { getAnalytics, isSupported } from 'firebase/analytics'
import { app } from './firebaseApp'

export async function initializeAnalytics() {
  return (await isSupported()) ? getAnalytics(app) : null
}
