import { initializeApp } from 'firebase/app'

const firebaseConfig = {
  apiKey: 'AIzaSyAc7CitvcJ2u2a5WGW0Lq6ve73pbDSO71A',
  authDomain: 'bdlegends.firebaseapp.com',
  projectId: 'bdlegends',
  storageBucket: 'bdlegends.firebasestorage.app',
  messagingSenderId: '417618092579',
  appId: '1:417618092579:web:568944e4d00a4482248796',
  measurementId: 'G-LQN8H9NB18',
}

export const app = initializeApp(firebaseConfig)
