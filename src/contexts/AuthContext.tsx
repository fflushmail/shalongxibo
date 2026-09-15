import React, { createContext, useContext, useState } from 'react'

export interface LocalUser {
  uid: string
  displayName: string
  photoURL: string | null
  email?: string | null
}

interface AuthContextType {
  user: LocalUser | null
  loading: boolean
  networkUnavailable: boolean
  updateDisplayName: (name: string) => void
  signInWithEmail: (email: string, password: string) => Promise<void>
  signUpWithEmail: (email: string, password: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
}

const LOCAL_USER_NAME_KEY = 'shalong_user_nickname'

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [displayName, setDisplayName] = useState<string>(() => {
    return localStorage.getItem(LOCAL_USER_NAME_KEY) || '学习者'
  })

  const user: LocalUser = {
    uid: 'local_user',
    displayName,
    photoURL: null,
  }

  const updateDisplayName = (name: string) => {
    const trimmed = name.trim() || '学习者'
    setDisplayName(trimmed)
    localStorage.setItem(LOCAL_USER_NAME_KEY, trimmed)
  }

  // Compatibility stubs so no calling component breaks
  const signInWithEmail = async () => {}
  const signUpWithEmail = async () => {}
  const signInWithGoogle = async () => {}
  const signOut = async () => {}

  return (
    <AuthContext.Provider
      value={{
        user,
        loading: false,
        networkUnavailable: false,
        updateDisplayName,
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
