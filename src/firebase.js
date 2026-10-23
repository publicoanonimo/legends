import { initializeApp } from 'firebase/app'
import { getAnalytics, isSupported } from 'firebase/analytics'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: 'AIzaSyAc7CitvcJ2u2a5WGW0Lq6ve73pbDSO71A',
  authDomain: 'bdlegends.firebaseapp.com',
  projectId: 'bdlegends',
  storageBucket: 'bdlegends.firebasestorage.app',
  messagingSenderId: '417618092579',
  appId: '1:417618092579:web:b86f66a9b58eb566248796',
  measurementId: 'G-876MLD9V6R',
}

export const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)

// Analytics only works in supported browser environments.
export const analytics = isSupported().then((supported) =>
  supported ? getAnalytics(app) : null,
)
