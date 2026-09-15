import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore, enableNetwork, disableNetwork, enableIndexedDbPersistence } from 'firebase/firestore'

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db   = getFirestore(app)
export const googleProvider = new GoogleAuthProvider()

// ── Offline persistence (IndexedDB cache) ─────────────────────────────────────
// This lets Firestore work from the local cache when there is no network
// (China firewall, airplane mode, etc.). Silently ignored if already enabled.
enableIndexedDbPersistence(db).catch(err => {
  if (err.code === 'failed-precondition') {
    // Multiple tabs open — persistence only available in one tab at a time
    console.info('[Firebase] Offline persistence unavailable (multiple tabs)')
  } else if (err.code === 'unimplemented') {
    // Browser doesn't support IndexedDB (very rare in Android WebView)
    console.info('[Firebase] Offline persistence not supported in this browser')
  }
})

// ── Network resilience helpers ────────────────────────────────────────────────
/** Call when you detect the device is offline to avoid Firestore timeouts */
export async function goOffline() {
  try { await disableNetwork(db) } catch { /* ignore */ }
}
/** Re-enable Firestore network once connectivity is restored */
export async function goOnline() {
  try { await enableNetwork(db) } catch { /* ignore */ }
}

export default app
