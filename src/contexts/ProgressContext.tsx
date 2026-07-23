import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from './AuthContext'

const LOCAL_KEY = 'shalong_xibo_progress'

interface ProgressContextType {
  learnedIds: Set<string>
  markLearned: (id: string) => void
  unmarkLearned: (id: string) => void
  isLearned: (id: string) => boolean
  totalLearned: number
}

const ProgressContext = createContext<ProgressContextType | null>(null)

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [learnedIds, setLearnedIds] = useState<Set<string>>(new Set())

  // Load progress from Firestore (logged in) or localStorage (guest)
  useEffect(() => {
    const loadProgress = async () => {
      if (user) {
        try {
          const ref = doc(db, 'users', user.uid, 'progress', 'words')
          const snap = await getDoc(ref)
          if (snap.exists()) {
            const data = snap.data()
            setLearnedIds(new Set(data.learnedIds || []))
          }
        } catch (err) {
          console.error('Failed to load progress from Firestore:', err)
          // Fallback to localStorage
          const local = localStorage.getItem(LOCAL_KEY)
          if (local) setLearnedIds(new Set(JSON.parse(local)))
        }
      } else {
        const local = localStorage.getItem(LOCAL_KEY)
        if (local) setLearnedIds(new Set(JSON.parse(local)))
      }
    }
    loadProgress()
  }, [user])

  const persist = useCallback(async (ids: Set<string>) => {
    const arr = [...ids]
    localStorage.setItem(LOCAL_KEY, JSON.stringify(arr))
    if (user) {
      try {
        const ref = doc(db, 'users', user.uid, 'progress', 'words')
        await setDoc(ref, { learnedIds: arr, lastUpdated: Date.now() }, { merge: true })
      } catch (err) {
        console.error('Failed to save progress to Firestore:', err)
      }
    }
  }, [user])

  const markLearned = useCallback((id: string) => {
    setLearnedIds(prev => {
      const next = new Set(prev)
      next.add(id)
      persist(next)
      return next
    })
  }, [persist])

  const unmarkLearned = useCallback((id: string) => {
    setLearnedIds(prev => {
      const next = new Set(prev)
      next.delete(id)
      persist(next)
      return next
    })
  }, [persist])

  const isLearned = useCallback((id: string) => learnedIds.has(id), [learnedIds])

  return (
    <ProgressContext.Provider value={{ learnedIds, markLearned, unmarkLearned, isLearned, totalLearned: learnedIds.size }}>
      {children}
    </ProgressContext.Provider>
  )
}

export function useProgress() {
  const ctx = useContext(ProgressContext)
  if (!ctx) throw new Error('useProgress must be used within ProgressProvider')
  return ctx
}
