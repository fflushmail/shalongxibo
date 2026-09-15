import React, { createContext, useContext, useEffect, useState } from 'react'
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  type User,
} from 'firebase/auth'
import { auth, googleProvider, goOffline, goOnline } from '../firebase'

interface AuthContextType {
  user:             User | null
  loading:          boolean
  /** True when Firebase Auth couldn't be reached (China firewall / offline) */
  networkUnavailable: boolean
  signInWithEmail:  (email: string, password: string) => Promise<void>
  signUpWithEmail:  (email: string, password: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  signOut:          () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

// How long to wait for Firebase Auth before treating network as unavailable
const AUTH_TIMEOUT_MS = 7000

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser]                         = useState<User | null>(null)
  const [loading, setLoading]                   = useState(true)
  const [networkUnavailable, setNetworkUnavailable] = useState(false)

  useEffect(() => {
    // Fallback timer: if Firebase doesn't resolve within AUTH_TIMEOUT_MS
    // (blocked by firewall, offline, etc.) we let the app continue in
    // offline / guest mode instead of showing a permanent spinner.
    const timer = setTimeout(() => {
      if (loading) {
        console.warn('[Auth] Firebase Auth timed out — offline/firewall mode')
        setNetworkUnavailable(true)
        setLoading(false)
        goOffline() // stop Firestore from retrying indefinitely
      }
    }, AUTH_TIMEOUT_MS)

    const unsubscribe = onAuthStateChanged(
      auth,
      u => {
        clearTimeout(timer)
        setUser(u)
        setLoading(false)
        setNetworkUnavailable(false)
        goOnline()  // restore Firestore network if it was previously disabled
      },
      err => {
        clearTimeout(timer)
        const code = (err as { code?: string }).code ?? 'unknown'
        console.warn('[Auth] onAuthStateChanged error:', code)
        setNetworkUnavailable(true)
        setLoading(false)
        goOffline()
      },
    )

    return () => {
      clearTimeout(timer)
      unsubscribe()
    }
  }, [])

  const signInWithEmail = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password)
  }

  const signUpWithEmail = async (email: string, password: string) => {
    await createUserWithEmailAndPassword(auth, email, password)
  }

  const signInWithGoogle = async () => {
    await signInWithPopup(auth, googleProvider)
  }

  const signOut = async () => {
    await firebaseSignOut(auth)
  }

  return (
    <AuthContext.Provider value={{
      user, loading, networkUnavailable,
      signInWithEmail, signUpWithEmail, signInWithGoogle, signOut,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
